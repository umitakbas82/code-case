import { Injectable, OnDestroy } from '@angular/core';
import { Subject, takeUntil, debounceTime, BehaviorSubject } from 'rxjs'; // debounceTime eklendi
import { LayerService } from './layer.service';
import { TaskService } from './task.service';
import { HistoryService } from './history.service';
import { Canvas, Rect, Image, FabricObject, Circle, Polygon, Point, Line, TEvent, IText, CanvasEvents } from 'fabric';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CanvasService implements OnDestroy {
  private canvas!: Canvas;
  private destroy$ = new Subject<void>();
  public selectedObject$ = new BehaviorSubject<FabricObject | null>(null);

  private drawingMode: 'polygon' | null = null;
  private polygonPoints: Point[] = [];
  private tempLines: Line[] = [];
  private currentTaskId: number | null = null;

  // YENİ: Durum kaydetme işlemini tetikleyecek olan Subject
  private stateSaveTrigger$ = new Subject<void>();

  constructor(
    private layerService: LayerService,
    private taskService: TaskService,
    private historyService: HistoryService,
    private router: Router
  ) {
    // --- Olay Dinleyicileri ---
    this.layerService.layerVisibilityChanged.pipe(takeUntil(this.destroy$)).subscribe(({ layerId, isVisible }) => this.updateObjectsVisibility(layerId, isVisible));
    this.layerService.layerLockChanged.pipe(takeUntil(this.destroy$)).subscribe(({ layerId, isLocked }) => this.updateObjectsLockStatus(layerId, isLocked));
    this.layerService.layerDeleted.pipe(takeUntil(this.destroy$)).subscribe(deletedLayerId => this.removeObjectsByLayerId(deletedLayerId));


    this.stateSaveTrigger$.pipe(
      debounceTime(300) // 300 milisaniye boyunca yeni bir tetikleme gelmezse çalış
    ).subscribe(() => {
      if (this.canvas) {
        const state = this.canvas.toObject(['layerId']);
        this.historyService.addState(state);
      }
    });
  }

  initCanvas(id: string): Canvas {
    this.canvas = new Canvas(id, {
      width: 800,
      height: 600,
      backgroundColor: '#fff',
    });

    this.canvas.on('mouse:down', (e: TEvent) => this.onMouseDown(e));
    this.canvas.on('mouse:dblclick', () => this.onMouseDoubleClick());
    this.canvas.on('selection:created', () => this.onObjectSelected());
    this.canvas.on('selection:updated', () => this.onObjectSelected());
    this.canvas.on('selection:cleared', () => this.onObjectDeselected());
    this.canvas.on('object:modified', () => this.triggerSaveState());

    setTimeout(() => this.triggerSaveState(), 50);

    return this.canvas;
  }

  //burada tetikleme yap
  private triggerSaveState(): void {
    this.stateSaveTrigger$.next();
  }

  // --- Geri Al / Yinele ---
  public undo(): void {
    const prevState = this.historyService.undo();
    if (prevState) { this.loadState(prevState); }
  }

  public redo(): void {
    const nextState = this.historyService.redo();
    if (nextState) { this.loadState(nextState); }
  }

  private loadState(state: any): void {

    const listeners: (keyof CanvasEvents)[] = [
      'object:modified',
      'selection:created',
      'selection:updated',
      'selection:cleared'
    ];

    listeners.forEach(event => this.canvas.off(event));

    this.canvas.loadFromJSON(state, () => {
      this.canvas.renderAll();

      this.canvas.on('object:modified', () => this.triggerSaveState());
      this.canvas.on('selection:created', () => this.onObjectSelected());
      this.canvas.on('selection:updated', () => this.onObjectSelected());
      this.canvas.on('selection:cleared', () => this.onObjectDeselected());
    });
  }



  async addImageToCanvas(url: string): Promise<void> {
    const activeLayerId = this.layerService.getActiveLayerIdValue();
    if (!activeLayerId) { return; }
    try {
      const img = await Image.fromURL(url);
      if (this.canvas) {
        img.scaleToWidth(this.canvas.width || 800);
        img.scaleToHeight(this.canvas.height || 600);
        img.set({ selectable: false, evented: false });
        img.layerId = activeLayerId;
        this.canvas.add(img);

        this.canvas.sendToBack(img);
        this.canvas.renderAll();
        this.triggerSaveState();
      }
    } catch (error) { console.error('Resim nesnesi oluşturulurken hata:', error); }
  }

  addRectangle(): void {
    const activeLayerId = this.layerService.getActiveLayerIdValue();
    if (!activeLayerId) { return; }
    const rect = new Rect({
      left: 100, top: 100, fill: 'rgba(255, 0, 0, 0.3)',
      stroke: 'red', strokeWidth: 2, width: 150, height: 100,
      layerId: activeLayerId
    });
    this.canvas?.add(rect);
    this.triggerSaveState();
  }

  addCircle(): void {
    const activeLayerId = this.layerService.getActiveLayerIdValue();
    if (!activeLayerId) { return; }
    const circle = new Circle({
      left: 200, top: 100, radius: 50, fill: 'rgba(0, 0, 255, 0.3)',
      stroke: 'blue', strokeWidth: 2,
      layerId: activeLayerId
    });
    this.canvas?.add(circle);
    this.triggerSaveState();
  }

  addText(): void {
    const activeLayerId = this.layerService.getActiveLayerIdValue();
    if (!activeLayerId) { return; }
    const text = new IText('Metni Düzenle', {
      left: 150, top: 150, fontSize: 24, fill: '#000000',
      fontFamily: 'Arial', layerId: activeLayerId
    });
    this.canvas?.add(text);
    this.canvas?.setActiveObject(text);
    this.canvas.renderAll(); // setActiveObject sonrası render gerekli
    this.triggerSaveState();
  }

  public startPolygonDrawing(): void {
    this.exitDrawingMode();
    this.drawingMode = 'polygon';
    this.canvas.selection = false;
    this.canvas.defaultCursor = 'crosshair';
  }

  private onMouseDown(event: TEvent): void {
    if (this.drawingMode !== 'polygon') { return; }
    const pointer = this.canvas.getPointer(event.e);
    const newPoint = new Point(pointer.x, pointer.y);
    this.polygonPoints.push(newPoint);
    if (this.polygonPoints.length > 1) {
      const prevPoint = this.polygonPoints[this.polygonPoints.length - 2];
      const line = new Line([prevPoint.x, prevPoint.y, newPoint.x, newPoint.y], {
        stroke: 'rgba(0,0,0,0.5)', strokeWidth: 1, selectable: false, evented: false,
      });
      this.tempLines.push(line);
      this.canvas.add(line);
    }
  }

  private onMouseDoubleClick(): void {
    if (this.drawingMode !== 'polygon' || this.polygonPoints.length < 3) {
      this.exitDrawingMode();
      return;
    }
    const activeLayerId = this.layerService.getActiveLayerIdValue();
    if (!activeLayerId) {
      this.exitDrawingMode();
      return;
    }
    const polygon = new Polygon(this.polygonPoints, {
      fill: 'rgba(0, 255, 0, 0.3)', stroke: 'green', strokeWidth: 2,
    });
    polygon.layerId = activeLayerId;
    this.canvas.add(polygon);
    this.exitDrawingMode();
    this.triggerSaveState();
  }

  private exitDrawingMode(): void {
    this.drawingMode = null;
    this.polygonPoints = [];
    if (this.tempLines.length > 0) {
      this.canvas.remove(...this.tempLines);
    }
    this.tempLines = [];
    this.canvas.selection = true;
    this.canvas.defaultCursor = 'default';
  }


  private updateObjectsVisibility(layerId: string, isVisible: boolean): void {
    if (!this.canvas) return;

    this.canvas.getObjects().forEach((obj: FabricObject) => {
      if (obj.layerId === layerId) {
        obj.set('visible', isVisible);
      }
    });

    this.canvas.renderAll();
    this.triggerSaveState(); // Bu değişiklik de geçmişe kaydedilmeli
  }


  private updateObjectsLockStatus(layerId: string, isLocked: boolean): void {
    if (!this.canvas) return;

    this.canvas.getObjects().forEach((obj: FabricObject) => {
      if (obj.layerId === layerId) {
        obj.set({
          selectable: !isLocked,
          evented: !isLocked,
        });
      }
    });

    this.canvas.renderAll();

  }

  public updateSelectedObjectProperties(props: any): void {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set(props);
      this.canvas.renderAll();
      this.triggerSaveState();
    }
  }

  private removeObjectsByLayerId(layerId: string): void {
    if (!this.canvas) return;
    const objectsToDelete = this.canvas.getObjects().filter(obj => obj.layerId === layerId);
    if (objectsToDelete.length > 0) {
      this.canvas.remove(...objectsToDelete);
      this.canvas.renderAll();
      this.triggerSaveState();
    }
  }


  private onObjectSelected(): void {
    const selectedObject = this.canvas.getActiveObject();
    this.selectedObject$.next(selectedObject || null);
  }

  private onObjectDeselected(): void {
    this.selectedObject$.next(null);
  }


  public setCurrentTaskId(id: number): void {
    this.currentTaskId = id;
  }


  public loadCanvasState(canvasState: any): void {
    if (this.canvas && canvasState) {

      this.loadState(canvasState);
    }
  }


  public saveCanvasState(): void {
    if (!this.currentTaskId) {
      console.error('Kaydedilecek bir görev ID\'si bulunamadı!');
      return;
    }




    // O anki katmanların durumunu al
    const layerState = this.layerService.getLayersValue();
    // Kanvastaki tüm nesnelerin durumunu al (layerId dahil)
    const canvasState = this.canvas.toObject(['layerId']);

    const annotationData = {
      layerState: layerState,
      canvasState: canvasState
    };

    console.log('Veritabanına Kaydediliyor...', annotationData);

    this.taskService.saveAnnotationForTask(this.currentTaskId, annotationData)
      .subscribe({
        next: () => alert('Çalışmanız başarıyla kaydedildi!'),
        error: (err) => console.error('Kaydetme sırasında hata oluştu:', err)
      });
  }



  public completeCurrentTask(): void {
    if (!this.currentTaskId) {
      console.error('Tamamlanacak bir görev ID\'si bulunamadı!');
      return;
    }


    if (confirm('Çalışmanızı kaydettiğinizden emin misiniz?\n\nGörevi tamamladıktan sonra Dashboard\'a yönlendirileceksiniz.')) {
      this.taskService.updateTaskStatus(this.currentTaskId, 'completed')
        .subscribe({
          next: () => {
            alert('Görev başarıyla tamamlandı! Dashboard\'a yönlendiriliyorsunuz.');

            this.router.navigate(['/dashboard']);
          },
          error: (err) => console.error('Görevi güncellerken hata oluştu:', err)
        });
    }
  }

  //subscription temizle
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
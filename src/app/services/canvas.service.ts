import { Injectable, OnDestroy } from '@angular/core';
import { Canvas, Rect, Image, FabricObject, Circle, Polygon, Point, Line, TEvent, IText } from 'fabric';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { LayerService } from './layer.service';
import { TaskService } from './task.service';


@Injectable({
  providedIn: 'root'
})
export class CanvasService implements OnDestroy {

  private canvas!: Canvas;
  //private activeLayerId: string | null = null; //Aktif katmanID
  private destroy$ = new Subject<void>();
  public selectedObject$ = new BehaviorSubject<FabricObject | null>(null);

  private drawingMode: 'polygon' | null = null;
  private polygonPoints: Point[] = []
  private tempLines: Line[] = [];
  private currentTaskId: number | null = null;

  constructor(private layerService: LayerService, private taskService: TaskService) {
    // this.layerService.getactiveLayerId().pipe(
    //   takeUntil(this.destroy$)
    // ).subscribe(id => {
    //   this.activeLayerId = id;
    // });


    //Layer kilit durumunu dinle
    this.layerService.layerLockChanged.pipe(
      takeUntil(this.destroy$)
    ).subscribe(({ layerId, isLocked }) => {
      this.updateObjectsLockStatus(layerId, isLocked);
    })


    //Layer görünürlük durumunu dinle
    this.layerService.layerVisibilityChanged.pipe(
      takeUntil(this.destroy$)
    ).subscribe(({ layerId, isVisible }) => {
      this.updateObjectsVisibility(layerId, isVisible);
    });
  }

  initCanvas(id: string): Canvas {
    this.canvas = new Canvas(id, {
      width: 800,
      height: 600,
      backgroundColor: '#fff'
    });

    this.canvas.on('mouse:down', (e) => this.onMouseDown(e))// Poligon çizimini başlatan envent burada olayları dinlemeye başla
    this.canvas.on('mouse:dblclick', () => this.onMouseDoubleClick());// Double Click ile çizim eventini bitir

    this.canvas.on('selection:created', (e) => this.onObjectSelected());//Metin objesini seç
    this.canvas.on('selection:updated', (e) => this.onObjectSelected());//Metin objesi update
    this.canvas.on('selection:cleared', () => this.onObjectDeselected());//Metin objesi artık deselect
    return this.canvas;
  }



  async addImageToCanvas(url: string): Promise<void> {
    const activeLayerId = this.layerService.getActiveLayerIdValue();
    if (!activeLayerId) {
      alert('Lütfen önce resmi eklemek istediğiniz katmanı seçin!');
      return;
    }
    try {
      const img = await Image.fromURL(url);
      if (this.canvas) {
        img.scaleToWidth(this.canvas.width || 800);
        img.scaleToHeight(this.canvas.height || 600);
        img.set({ selectable: false, evented: false });
        img.layerId = activeLayerId;
        this.canvas.add(img);

        this.canvas.sendObjectToBack(img);
        this.canvas.renderAll();
      }
    } catch (error) {
      console.error('Resim nesnesi oluşturulurken bir hata oluştu:', error);
    }
  }






  addRectangle(): void {
    const activeLayerId = this.layerService.getActiveLayerIdValue();
    if (!activeLayerId) {
      alert('Lütfen önce bir katman seçin!');
      return;
    }

    const rect = new Rect({
      left: 100,
      top: 100,
      fill: 'rgba(255, 0, 0, 0.3)',
      stroke: 'red',
      strokeWidth: 2,
      width: 150,
      height: 100,
      layerId: activeLayerId
    });
    console.log('Atanan Katman ID:', rect.layerId);
    this.canvas?.add(rect);
  }


  addCircle() {
    const activeLayerId = this.layerService.getActiveLayerIdValue();

    if (!activeLayerId) {
      alert('Lütfen bir katman seçiniz');
      return;
    }
    const circle = new Circle({
      left: 200,
      top: 100,
      radius: 50,
      fill: 'rgba(0, 0, 255, 0.3)',
      stroke: 'blue',
      strokeWidth: 2,
      layerId: activeLayerId

    });

    this.canvas?.add(circle)

  }


  public startPolygonDrawing() {
    this.exitDrawingMode();
    this.drawingMode = 'polygon';
    this.canvas.selection = false,
      this.canvas.defaultCursor = 'crosshair'
    console.log('Poligon çizim modu başladı. Lütfen noktaları eklemek için tıklayın.');
  }

  private onMouseDown(event: TEvent) {
    if (this.drawingMode !== 'polygon') {
      return;
    }

    const pointer = this.canvas.getPointer(event.e);
    const newPoint = new Point(pointer.x, pointer.y);
    this.polygonPoints.push(newPoint);

    if (this.polygonPoints.length > 1) {
      const prevPoint = this.polygonPoints[this.polygonPoints.length - 2];
      const line = new Line([prevPoint.x, prevPoint.y, newPoint.x, newPoint.y], {
        stroke: 'rgba(0,0,0,0.5)',
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });

      this.tempLines.push(line);
      this.canvas.add(line);
    }
    console.log('Nokta eklendi', newPoint)



  }


  private onMouseDoubleClick() {

    //Eğer 3den az köşe varsa çık
    if (this.drawingMode !== 'polygon' || this.polygonPoints.length < 3) {
      this.exitDrawingMode();
      return;
    }

    //Eğer katman seçili değilse çık
    const activeLayerId = this.layerService.getActiveLayerIdValue();
    if (!activeLayerId) {
      alert('Aktif bir katman seçili değil')
      this.exitDrawingMode();
      return;
    }

    //Poligon nihayi oluşturma!!!
    const polygon = new Polygon(this.polygonPoints, {
      fill: 'rgba(0, 255, 0, 0.3)',
      stroke: 'green',
      strokeWidth: 2,

    });
    polygon.layerId = activeLayerId;

    this.canvas.add(polygon);
    console.log('Poligon eklendi.')

    //Herşeyi bitir ve normale dön
    this.exitDrawingMode();
  }

  private exitDrawingMode() {
    this.drawingMode = null;
    this.polygonPoints = [];
    this.canvas.remove(...this.tempLines);
    this.tempLines = [];
    this.canvas.selection = true;
    this.canvas.defaultCursor = 'default'

    console.log('Poligon çizimi kapatıldı')
  }





  private updateObjectsVisibility(layerId: string, isVisible: boolean): void {
    if (!this.canvas) return;


    this.canvas.getObjects().forEach((obj: FabricObject) => {


      if (obj.layerId === layerId) {
        obj.set('visible', isVisible);
      }
    });


    this.canvas.renderAll();
  }


  private updateObjectsLockStatus(LayerId: string, isLocked: boolean) {
    if (!this.canvas) return;


    this.canvas.getObjects().forEach((obj: FabricObject) => {
      if (obj.layerId === LayerId) {
        obj.set({
          selectable: !isLocked,
          evented: !isLocked,
        });
      }
    });
  }

  //Metin ekle
  addText() {
    const activeLayerId = this.layerService.getActiveLayerIdValue();
    if (!activeLayerId) {
      alert('Bir Katman seçiniz');
      return;
    }

    const text = new IText('Metni Düzenle', {
      left: 150,
      top: 150,
      fontSize: 24,
      fill: '#000000',
      fontFamily: 'Arial',
      layerId: activeLayerId
    });

    this.canvas?.add(text);
    this.canvas?.setActiveObject(text);
    this.canvas.renderAll();
  }

  private onObjectSelected() {
    const selectedObject = this.canvas.getActiveObject();
    this.selectedObject$.next(selectedObject || null);
  }


  private onObjectDeselected(): void {
    this.selectedObject$.next(null);
  }


  public updateSelectedObjectProperties(props: any): void {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set(props);
      this.canvas.renderAll();
    }
  }



  public setCurrentTaskId(id: number): void {
    this.currentTaskId = id;
  }

  public saveCanvasState(): void {
    if (!this.currentTaskId) {
      console.error('Kaydedilecek bir görev ID\'si bulunamadı!');
      return;
    }

    // O anki katmanların durumunu al 
    const layerState = this.layerService.getLayersValue();

    // 2. DEĞİŞİKLİK: 'toJSON' yerine 'toObject' metodunu kullanıyoruz.
    // Bu metot, özel özelliklerimizi de JSON'a dahil etmemize olanak tanır.
    const canvasState = this.canvas.toObject(['layerId']);

    const annotationData = {
      layerState: layerState,
      canvasState: canvasState
    };

    console.log('Kaydediliyor...', annotationData);

    this.taskService.saveAnnotationForTask(this.currentTaskId, annotationData)
      .subscribe({
        next: () => alert('Çalışmanız başarıyla kaydedildi!'),
        error: (err) => console.error('Kaydetme sırasında hata oluştu:', err)
      });
  }

  //Subscription Temizle
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}




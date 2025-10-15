import { Injectable, OnDestroy } from '@angular/core';
import { Canvas, Rect, Image, FabricObject } from 'fabric';
import { Subject, takeUntil } from 'rxjs';
import { LayerService } from './layer.service';
import fabric from 'fabric/fabric-impl';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  private canvas!: Canvas;
  //private activeLayerId: string | null = null; //Aktif katmanID
  private destroy$ = new Subject<void>();




  constructor(private layerService: LayerService) {
    // this.layerService.getactiveLayerId().pipe(
    //   takeUntil(this.destroy$)
    // ).subscribe(id => {
    //   this.activeLayerId = id;
    // });

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
    return this.canvas;
  }



  async setBackgroundImage(url: string): Promise<void> {
    try {

      const img = await Image.fromURL(url);

      if (this.canvas) {

        this.canvas.backgroundImage = img;


        img.scaleToWidth(this.canvas.width || 800);
        img.scaleToHeight(this.canvas.height || 600);


        this.canvas.renderAll();
      }
    } catch (error) {
      console.error('Arka plan resmi yüklenirken bir hata oluştu:', error);
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
    });
    console.log('Atanan Katman ID:', rect.layerId);
    this.canvas?.add(rect);
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

  //Subscription Temizle
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}




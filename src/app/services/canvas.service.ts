import { Injectable } from '@angular/core';
import * as fabric from 'fabric';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  private canvas!: fabric.Canvas;

  constructor() { }

  initCanvas(id: string): fabric.Canvas {
    this.canvas = new fabric.Canvas(id, {
      width: 800,
      height: 600,
      backgroundColor: '#fff'
    });
    return this.canvas;
  }



  async setBackgroundImage(url: string): Promise<void> {
    try {

      const img = await fabric.Image.fromURL(url);

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
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'rgba(255, 0, 0, 0.3)',
      stroke: 'red',
      strokeWidth: 2,
      width: 150,
      height: 100,
    });
    this.canvas?.add(rect);
  }

}




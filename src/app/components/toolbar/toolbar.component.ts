import { Component } from '@angular/core';
import { CanvasService } from '../../services/canvas.service';
import { Polygon } from 'fabric';
import { HistoryService } from '../../services/history.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {

  //Hangi aracın aktif olduğunu bul
  public activeTool: 'rect' | 'circle' | 'polygon' | 'text' | null = null;


  constructor(public canvasService: CanvasService, public historyService: HistoryService) { }

  //Resmi CanvasService ile yükleme
  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;

        this.canvasService.addImageToCanvas(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  }


  //Dikdörtgen çiz
  addRectangle(): void {
    this.activeTool = 'rect'
    this.canvasService.addRectangle();
  }

  //Daire Çiz
  addCircle() {
    this.activeTool = 'circle';
    this.canvasService.addCircle();

  }


  startPolygon() {
    this.activeTool = 'polygon';
    this.canvasService.startPolygonDrawing()
  }


  addText() {
    this.activeTool = 'text';
    this.canvasService.addText();
  }

  save(): void {
    this.canvasService.saveCanvasState();
  }

  undo(): void {
    this.canvasService.undo();
  }

  redo(): void {
    this.canvasService.redo();
  }

  completeTask(): void {
    this.canvasService.completeCurrentTask();
  }
}



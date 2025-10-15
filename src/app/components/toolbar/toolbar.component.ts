import { Component } from '@angular/core';
import { CanvasService } from '../../services/canvas.service';

@Component({
  selector: 'app-toolbar',
  imports: [],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  constructor(private canvasService: CanvasService) { }

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

  addRectangle(): void {
    this.canvasService.addRectangle();
  }

}

import { Component } from '@angular/core';
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { CanvasComponent } from "../canvas/canvas.component";
import { LayerManagerComponent } from '../layer-manager/layer-manager.component';

@Component({
  selector: 'app-annotation-page',
  imports: [ToolbarComponent, CanvasComponent, LayerManagerComponent],
  templateUrl: './annotation-page.component.html',
  styleUrl: './annotation-page.component.css'
})
export class AnnotationPageComponent {

}

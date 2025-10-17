import { Component } from '@angular/core';
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { CanvasComponent } from "../canvas/canvas.component";
import { LayerManagerComponent } from '../layer-manager/layer-manager.component';
import { CommonModule } from '@angular/common';
import { PropertiesPanelComponent } from '../properties-panel/properties-panel.component';

@Component({
  selector: 'app-annotation-page',
  imports: [CommonModule, ToolbarComponent, CanvasComponent, LayerManagerComponent, PropertiesPanelComponent],
  templateUrl: './annotation-page.component.html',
  styleUrl: './annotation-page.component.css'
})
export class AnnotationPageComponent {

}

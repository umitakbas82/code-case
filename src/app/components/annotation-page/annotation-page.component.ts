import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // ActivatedRoute ve Router eklendi
import { of, switchMap } from 'rxjs'; // switchMap eklendi

import { CanvasComponent } from '../canvas/canvas.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { LayerManagerComponent } from '../layer-manager/layer-manager.component';
import { PropertiesPanelComponent } from '../properties-panel/properties-panel.component';
import { TaskService } from '../../services/task.service'; // TaskService eklendi
import { CanvasService } from '../../services/canvas.service'; // CanvasService eklendi
import { LayerService } from '../../services/layer.service';

@Component({
  selector: 'app-annotation-page',
  standalone: true,
  imports: [
    CommonModule,
    CanvasComponent,
    ToolbarComponent,
    LayerManagerComponent,
    PropertiesPanelComponent,
  ],
  templateUrl: './annotation-page.component.html',
  styleUrls: ['./annotation-page.component.css'],
})
export class AnnotationPageComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private canvasService: CanvasService,
    private layerService: LayerService
  ) {
    this.route.paramMap.pipe(
      switchMap(params => {
        const taskId = params.get('taskId');
        if (taskId) {
          return this.taskService.getTaskById(+taskId);
        }
        return of(null);
      })
    ).subscribe(task => {
      if (task) {
        // Görev ID'sini CanvasService'e bildir
        this.canvasService.setCurrentTaskId(task.id);

        // 1. Önce görevin resmini kanvasa yükle
        this.canvasService.addImageToCanvas(task.imageUrl);

        // 2. Ardından, bu göreve ait annotation verisini iste
        this.taskService.getAnnotationForTask(task.id).subscribe(annotationData => {
          if (annotationData && annotationData.layerState && annotationData.canvasState) {
            console.log('Kayıtlı veri bulundu ve yükleniyor...', annotationData);
            // 3. Gelen veriyle katmanları ve kanvası geri yükle
            this.layerService.loadLayers(annotationData.layerState);
            this.canvasService.loadCanvasState(annotationData.canvasState);
          }
        });
      }
    });
  }




  ngOnInit(): void {
    // Component yüklendiğinde, URL'deki değişiklikleri dinle
    this.route.paramMap.pipe(
      switchMap(params => {
        // 1. URL'den 'taskId' parametresini al
        const taskId = params.get('taskId');
        if (taskId) {

          return this.taskService.getTaskById(+taskId);
        }

        return [null];
      })
    ).subscribe(task => {

      if (task && task.imageUrl) {
        setTimeout(() => {
          this.canvasService.addImageToCanvas(task.imageUrl);
        }, 100);
      }
    });
  }
}
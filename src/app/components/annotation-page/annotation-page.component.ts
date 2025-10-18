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
  // Gerekli servisleri ve router'ı constructor'a inject ediyoruz
  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private canvasService: CanvasService
  ) {
    this.route.paramMap.pipe(
      // 1. switchMap operatörünü ekliyoruz. Bu, bir Observable'ı diğerine dönüştürür.
      switchMap(params => {
        // Gelen parametre (params) bir ParamMap nesnesidir.
        const taskId = params.get('taskId');
        if (taskId) {
          // Parametreden gelen ID ile TaskService'ten asıl görevi istiyoruz.
          // Bu, bir Observable<Task> döndürür.
          return this.taskService.getTaskById(+taskId);
        }
        // Eğer URL'de ID yoksa, 'null' içeren bir observable döndürüyoruz.
        return of(null);
      })
      // 3. Subscribe bloğuna artık ParamMap değil, Task nesnesi (veya null) gelir.
    ).subscribe(task => {
      // 'task' artık bir görev nesnesidir ve 'imageUrl' özelliğine sahiptir.
      if (task && task.imageUrl) {
        this.canvasService.setCurrentTaskId(task.id);
        setTimeout(() => {
          this.canvasService.addImageToCanvas(task.imageUrl);
        }, 100);
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
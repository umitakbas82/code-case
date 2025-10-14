import { AfterViewInit, Component } from '@angular/core';
import { CanvasService } from '../../services/canvas.service';

@Component({
  selector: 'app-canvas',
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements AfterViewInit {

  constructor(private canvasService: CanvasService) { }

  ngAfterViewInit(): void {
    this.canvasService.initCanvas('fabric-canvas')
  }

}

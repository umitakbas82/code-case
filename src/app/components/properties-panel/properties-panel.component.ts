import { Component, OnInit } from '@angular/core';
import { FabricObject, } from 'fabric';
import { CanvasService } from '../../services/canvas.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-properties-panel',
  imports: [],
  templateUrl: './properties-panel.component.html',
  styleUrl: './properties-panel.component.css'
})
export class PropertiesPanelComponent implements OnInit {

  selectedObject$: Observable<FabricObject | null>;

  constructor(private canvasService: CanvasService) {
    this.selectedObject$ = this.canvasService.selectedObject$


  }

  ngOnInit(): void { }

  //Burası renk değişimi 
  changeProperty(event: Event, property: string) {
    const value = (event.target as HTMLInputElement).value;
    this.canvasService.updateSelectedObjectProperties({ property: value });
  }


  //burası font boyutu vb..
  changeNumericProperty(event: Event, property: string) {
    const value = parseFloat((event.target as HTMLInputElement).value);

    this.canvasService.updateSelectedObjectProperties({ [property]: value })

  }



}

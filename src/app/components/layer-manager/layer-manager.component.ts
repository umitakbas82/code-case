import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Layer } from '../../models/layerModel';
import { LayerService } from '../../services/layer.service';

@Component({
  selector: 'app-layer-manager',
  imports: [CommonModule],
  templateUrl: './layer-manager.component.html',
  styleUrl: './layer-manager.component.css'
})
export class LayerManagerComponent implements OnInit {
  layers$!: Observable<Layer[]>;

  constructor(private layerService: LayerService) { }

  ngOnInit(): void {
    this.layers$ = this.layerService.getLayers();
  }



}

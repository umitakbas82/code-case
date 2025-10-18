import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  activeLayerId$!: Observable<string | null>;
  @ViewChild('layerNameInput') layerNameInputElement!: ElementRef<HTMLInputElement>;




  constructor(private layerService: LayerService) {
    console.log('LayerManagerComponent Constructor ÇALIŞTI!');
  }

  ngOnInit(): void {
    this.layers$ = this.layerService.getLayers();
    this.activeLayerId$ = this.layerService.getactiveLayerId();
  }


  //Katman ekle
  // addNewLayer(): void {
  //   const layerName = prompt('Yeni katman adı:', `Katman ${Math.floor(Math.random() * 100)}`);
  //   if (layerName) {
  //     this.layerService.addLayer(layerName);
  //   }
  // }


  saveNewLayer(): void {
    const layerName = this.layerNameInputElement.nativeElement.value;
    if (layerName && layerName.trim() !== '') {
      this.layerService.addLayer(layerName.trim());
      // Input'u temizle
      this.layerNameInputElement.nativeElement.value = '';
    }
  }



  setactivateLayer(id: string) {
    this.layerService.setActiveLayer(id);
  }


  toggleVisibility(id: string, event: MouseEvent) {
    event.stopPropagation()
    this.layerService.toggleLayerVisibility(id);
  }
  toggleLock(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.layerService.toggleLayerLock(id)
  }

  renameLayer(layer: Layer, event: MouseEvent): void {
    event.stopPropagation();
    const newName = prompt('Yeni katman adı:', layer.name);
    // Eğer kullanıcı yeni bir isim girdiyse ve iptal etmediyse
    if (newName && newName.trim() !== '') {
      this.layerService.renameLayer(layer.id, newName.trim());
    }
  }

  deleteLayer(id: string, event: MouseEvent): void {
    event.stopPropagation();
    if (confirm('Bu katmanı ve içindeki tüm çizimleri kalıcı olarak silmek istediğinizden emin misiniz?')) {
      this.layerService.deleteLayer(id);
    }
  }

}

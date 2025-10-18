import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Layer } from '../models/layerModel';


@Injectable({
  providedIn: 'root'
})
export class LayerService {
  private readonly layers$ = new BehaviorSubject<Layer[]>([]);
  private activeLayerId$ = new BehaviorSubject<string | null>(null);
  public layerVisibilityChanged = new Subject<{ layerId: string; isVisible: boolean }>();
  public layerLockChanged = new Subject<{ layerId: string; isLocked: boolean }>();


  constructor() {
    this.addLayer('Varsayılan Katman')
    console.log('LayerService Constructor Bitti. O anki aktif ID:', this.getActiveLayerIdValue());
  }//uygulama başlarken varsayılan boş bir katman 



  //Yeni katman oluştur 
  addLayer(name: string) {
    const newLayer: Layer = {
      id: self.crypto.randomUUID(),// layer arası karışıklıkları önlemek için UUID olarak tutuyorum
      name: name,
      isVisible: true,
      isLocked: false,
    };

    const currentLayers = this.layers$.getValue();
    this.layers$.next([...currentLayers, newLayer]);


    //hiç aktif katman yoksa ilk ekleneni aktif olarak atama yap!!!
    if (!this.activeLayerId$.getValue()) {
      this.setActiveLayer(newLayer.id);
    }

  }

  setActiveLayer(id: string) {
    this.activeLayerId$.next(id);
  }

  //Layer getir
  getLayers(): Observable<Layer[]> {
    return this.layers$.asObservable();
  }

  getactiveLayerId(): Observable<string | null> {
    return this.activeLayerId$.asObservable();
  }

  getActiveLayerIdValue(): string | null {
    return this.activeLayerId$.getValue();
  }

  //Katman görünürlüğü durumu
  toggleLayerVisibility(id: string): void {
    const currentLayers = this.layers$.getValue();

    const updatedLayers = currentLayers.map(layer => {
      if (layer.id === id) {
        // ID eşleşirse, isVisible özelliğini tersine çevir
        return { ...layer, isVisible: !layer.isVisible };
      }
      return layer;
    });

    const changedLayer = updatedLayers.find(l => l.id === id);
    // Güncellenmiş listeyi BehaviorSubject'e gönder
    this.layers$.next(updatedLayers);

    if (changedLayer) {
      this.layerVisibilityChanged.next({ layerId: changedLayer.id, isVisible: changedLayer.isVisible });
    }
  }

  //Layer kilitle ve aç
  toggleLayerLock(id: string) {
    const currentLayers = this.layers$.getValue();
    const updatedLayers = currentLayers.map(layer => {
      if (layer.id === id) {
        return { ...layer, isLocked: !layer.isLocked }
      }
      return layer;
    });

    this.layers$.next(updatedLayers);

    const changedLayer = updatedLayers.find(l => l.id === id);
    if (changedLayer) {
      this.layerLockChanged.next({ layerId: changedLayer.id, isLocked: changedLayer.isLocked })//değişikliği canvas servise BİLDİR!!!
    }
  }


  public getLayersValue(): Layer[] {
    return this.layers$.getValue();
  }


  public loadLayers(layers: Layer[]): void {
    this.layers$.next(layers);

    if (layers.length > 0) {
      this.setActiveLayer(layers[0].id);
    }
  }
}

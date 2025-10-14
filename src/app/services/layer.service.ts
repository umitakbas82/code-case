import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Layer } from '../models/layerModel';


@Injectable({
  providedIn: 'root'
})
export class LayerService {
  private readonly layers$ = new BehaviorSubject<Layer[]>([]);
  private readonly activeLayerId$ = new BehaviorSubject<string | null>(null);
  constructor() { this.addLayer('Varsayılan Katman') }//uygulama başlarken varsayılan boş bir katman 



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
}

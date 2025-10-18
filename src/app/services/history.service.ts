import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private history: object[] = [];
  private historyPointer = -1;

  public undoStatus = new BehaviorSubject<boolean>(false);
  public redoStatus = new BehaviorSubject<boolean>(false);
  constructor() { }


  addState(state: object) {
    if (this.historyPointer < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyPointer + 1);
    }
    this.history.push(state);
    this.historyPointer++;
    this.updateStatus();
  }


  undo(): object | null {
    if (this.historyPointer > 0) {
      this.historyPointer--;
      this.updateStatus();
      return this.history[this.historyPointer];
    }
    return null; // buradan Geri alınacak bir şey yok!!!
  }


  redo(): object | null {
    if (this.historyPointer < this.history.length - 1) {
      this.historyPointer++;
      this.updateStatus();
      return this.history[this.historyPointer];
    }
    return null; // Burada da İleri alınacak bir şey yok!!
  }


  //Durumları güncelle
  private updateStatus(): void {
    this.undoStatus.next(this.historyPointer > 0);
    this.redoStatus.next(this.historyPointer < this.history.length - 1);
  }

}

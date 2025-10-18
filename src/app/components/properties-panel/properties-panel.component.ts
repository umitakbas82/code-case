import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasService } from '../../services/canvas.service';
import { Subject, takeUntil } from 'rxjs';
import { FabricObject, IText } from 'fabric';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './properties-panel.component.html',
  styleUrls: ['./properties-panel.component.css']
})
export class PropertiesPanelComponent implements OnInit, OnDestroy {

  public selectedObject: FabricObject | null = null;
  private destroy$ = new Subject<void>();


  @ViewChild('fontSizeInput') fontSizeInputElement?: ElementRef<HTMLInputElement>;

  constructor(
    private canvasService: CanvasService,
    private cdr: ChangeDetectorRef // Değişiklikleri manuel tetiklemek için
  ) { }

  ngOnInit(): void {

    this.canvasService.selectedObject$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(obj => {
      this.selectedObject = obj;

      // Nesne değiştiğinde, input'un değerini manuel olarak ayarla
      this.updateFontSizeInput();

      // View'ı manuel olarak güncellemeye zorla
      this.cdr.detectChanges();
    });
  }

  // Component yok olduğunda subscription'ı temizle
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Değeri manuel olarak input'a yazan metot
  private updateFontSizeInput(): void {

    if (this.isTextObject(this.selectedObject) && this.fontSizeInputElement) {
      this.fontSizeInputElement.nativeElement.value = this.selectedObject.fontSize?.toString() || '';
    }
  }

  // Bu bir "Type Guard"dır.
  public isTextObject(obj: FabricObject | null): obj is IText {
    return obj?.type === 'i-text';
  }


  changeProperty(event: Event, property: string): void {
    const value = (event.target as HTMLInputElement).value;
    this.canvasService.updateSelectedObjectProperties({ [property]: value });
  }

  changeNumericProperty(event: Event, property: string): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.canvasService.updateSelectedObjectProperties({ [property]: value });
  }
}
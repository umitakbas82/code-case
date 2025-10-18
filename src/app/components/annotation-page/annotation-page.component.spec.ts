import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router'; // import edin
import { of } from 'rxjs'; // import edin
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Bu da gerekli olacak

import { AnnotationPageComponent } from './annotation-page.component';

describe('AnnotationPageComponent', () => {
  let component: AnnotationPageComponent;
  let fixture: ComponentFixture<AnnotationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AnnotationPageComponent,
        HttpClientTestingModule // Diğer servislerin bağımlılığı için
      ],
      providers: [
        // ActivatedRoute için sahte bir sağlayıcı (provider) oluşturuyoruz
        {
          provide: ActivatedRoute,
          useValue: {
            // paramMap'in, içinde '1' olan sahte bir Observable döndürmesini sağlıyoruz
            paramMap: of({ get: (key: string) => '1' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnnotationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
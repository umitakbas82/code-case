import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnnotationPageComponent } from './components/annotation-page/annotation-page.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AnnotationPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'code-case';
}

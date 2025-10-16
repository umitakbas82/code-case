import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }


  login() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Kullanııcı adı ve şifre boş olamaz';
      return;
    }

    this.authService.login(this.username, this.password).subscribe(user => {
      if (user) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Geçersiz kullanıcı adı veya şifre'
      }
    })
  }
}

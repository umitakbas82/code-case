import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { User } from '../models/userModel';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;


  constructor(private router: Router, private http: HttpClient) {

    //Localstorageyi kontrolet 
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }


  //kullanıcı değerini döndür
  public get currentUserValue(): User | null {
    return this.currentUserSubject.getValue()
  }

  //Kullanıcı Giriş yaptımı??
  public isAuthenticated(): boolean {
    return !!this.currentUserValue
  }


  //login method
  login(username: string, password: string): Observable<User | null> {
    return this.http.get<User[]>(`${this.apiUrl}/users?username=${username}&password=${password}`).pipe(
      map(users => {

        const user = users[0];
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user))
          this.currentUserSubject.next(user);
          return user;
        }
        return null;
      })
    )
  }
  //kullanıcı çıkış yaptı
  logout(): void {

    localStorage.removeItem('currentUser');

    this.currentUserSubject.next(null);

    this.router.navigate(['/login']);
  }
}

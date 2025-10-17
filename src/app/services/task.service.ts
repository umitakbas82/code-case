import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

import { Task } from '../models/taskModel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }


  getTaskForUser(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks?userId=${userId}`);
  }

  getTaskById(id: number) {
    return this.http.get<Task>(`${this.apiUrl}/tasks/${id}`);
  }

}

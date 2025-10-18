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

  //Burada kaydetme methodu var
  saveAnnotationForTask(taskId: number, annotationData: any): Observable<any> {
    const dataToSave = {
      id: taskId,
      ...annotationData
    };
    return this.http.put(`${this.apiUrl}/annotations/${taskId}`, dataToSave);
  }

  //Burada son kaydedlileni geri getirme
  getAnnotationForTask(taskId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/annotations/${taskId}`);
  }
}

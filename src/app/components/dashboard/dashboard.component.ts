import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { User } from '../../models/userModel';
import { Task } from '../../models/taskModel';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  public currentUser$: Observable<User | null>;
  public tasks$!: Observable<Task[]>;

  constructor(public authService: AuthService, private taskService: TaskService) {
    this.currentUser$ = this.authService.currentUser$
  }

  ngOnInit(): void {
    //anlık kullanıcıyı al
    const currentUser = this.authService.currentUserValue;
    //kullanıcı varsa görevlerini iste
    if (currentUser) {
      this.tasks$ = this.taskService.getTaskForUser(currentUser.id)
    }

  }


  logout() {
    this.authService.logout();
  }






}

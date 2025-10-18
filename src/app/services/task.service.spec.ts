import { TestBed } from '@angular/core/testing';
// 1. HttpClientTestingModule'ü import edin
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // 2. imports dizisine HttpClientTestingModule'ü ekleyin
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8000/api/tasks/tasks/';
  private usersUrl = 'http://localhost:8000/api/employees/';

  constructor(private http: HttpClient) {}

  // Obtener tareas para el calendario
  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Crear una nueva tarea asignada
  createTask(taskData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, taskData);
  }

  // Obtener la lista de subordinados para el selector
  getSubordinates(): Observable<any[]> {
    return this.http.get<any[]>(this.usersUrl);
  }
}
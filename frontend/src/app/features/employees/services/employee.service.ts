import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  crearEmpleado(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/employees/nuevo/`, datos);
  }
  getUnidades(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/core/unidades/`);
  }

  getPuestos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/core/puestos/`);
  }

  getManagers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employees/managers/`);
  }
  getEmpleados(busqueda: string = ''): Observable<any[]> {
    let url = this.apiUrl + '/employees/'; // http://localhost:8000/api/employees/
    if (busqueda) {
      url += `?search=${busqueda}`;
    }
    return this.http.get<any[]>(url);
  }

  getEmpleadoPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employees/${id}/`);
  }

  actualizarEmpleado(id: string, datos: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/employees/${id}/`, datos);
  }

  eliminarEmpleado(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/employees/${id}/`);
  }
}

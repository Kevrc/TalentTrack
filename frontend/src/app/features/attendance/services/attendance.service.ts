import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/attendance/marcar/`;

  marcarAsistencia(tipo: string, lat: number, lng: number, fotoFile: File) {
    const formData = new FormData();

    // Agregamos los campos que espera Django (según probamos en Postman)
    formData.append('tipo', tipo); // 'CHECK_IN' o 'CHECK_OUT'
    formData.append('gps_lat', lat.toString());
    formData.append('gps_lng', lng.toString());

    // Fecha dispositivo (ISO format)
    formData.append('fecha_hora_dispositivo', new Date().toISOString());

    // El archivo de imagen
    formData.append('foto_url', fotoFile);

    return this.http.post(this.apiUrl, formData);
  }
  getHistorial() {
    return this.http.get<any[]>(`${environment.apiUrl}/attendance/historial/`);

    // Realizar cambios en el backend para que devuelva datos adecuados
  }
  // ... dentro de AttendanceService
  getAsistenciaEquipo(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/attendance/equipo/`);
  }
}

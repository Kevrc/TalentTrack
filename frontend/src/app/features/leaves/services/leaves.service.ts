import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface TipoAusencia {
  id: string;
  nombre: string;
  requiere_soporte: boolean;
}

export interface SolicitudAusencia {
  tipo_ausencia: string; // ID del tipo
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string; // YYYY-MM-DD
  motivo: string;
  adjunto?: File; // Opcional
}

@Injectable({
  providedIn: 'root',
})
export class LeavesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/leaves`; // http://localhost:8000/api/leaves

  getTiposAusencia(): Observable<TipoAusencia[]> {
    return this.http.get<TipoAusencia[]>(`${this.apiUrl}/tipos/`);
  }

  crearSolicitud(datos: SolicitudAusencia): Observable<any> {
    const formData = new FormData();

    formData.append('tipo_ausencia', datos.tipo_ausencia);
    formData.append('fecha_inicio', datos.fecha_inicio);
    formData.append('fecha_fin', datos.fecha_fin);
    formData.append('motivo', datos.motivo);

    if (datos.adjunto) {
      formData.append('adjunto_url', datos.adjunto);
    }

    return this.http.post(`${this.apiUrl}/solicitudes/`, formData);
  }

  getMisSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/solicitudes/`);
  }
  
  getPendientesEquipo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pendientes/`);
  }

  getSolicitudesEmpresa(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empresa/`);
  }

  responderSolicitud(idSolicitud: string, nuevoEstado: 'APROBADO' | 'RECHAZADO'): Observable<any> {
    // PATCH http://localhost:8000/api/leaves/responder/{uuid}/
    return this.http.patch(`${this.apiUrl}/responder/${idSolicitud}/`, {
      estado: nuevoEstado,
    });
  }
}

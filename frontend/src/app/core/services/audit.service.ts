import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LogAuditoria {
  id: string;
  usuario: string;
  usuario_email: string;
  usuario_rol: string;
  accion: string;
  entidad: string;
  entidad_id: string;
  detalles: Record<string, any> | null;
  fecha: string;
  descripcion?: string;
  timestamp?: string;
}

export interface AuditFilters {
  accion?: string;
  entidad?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  usuario?: string;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/core/superadmin/auditoria`;

  /**
   * Obtener todos los logs de auditoría
   */
  getAuditLogs(filters?: AuditFilters): Observable<LogAuditoria[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.accion) params = params.set('accion', filters.accion);
      if (filters.entidad) params = params.set('entidad', filters.entidad);
      if (filters.fecha_desde) params = params.set('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params = params.set('fecha_hasta', filters.fecha_hasta);
      if (filters.usuario) params = params.set('usuario', filters.usuario);
    }

    return this.http.get<LogAuditoria[]>(`${this.apiUrl}/`, { params });
  }

  /**
   * Obtener log específico
   */
  getAuditLog(id: string): Observable<LogAuditoria> {
    return this.http.get<LogAuditoria>(`${this.apiUrl}/${id}/`);
  }

  /**
   * Obtener logs por acción
   */
  getLogsByAccion(accion: string): Observable<LogAuditoria[]> {
    return this.getAuditLogs({ accion });
  }

  /**
   * Obtener logs por entidad
   */
  getLogsByEntidad(entidad: string): Observable<LogAuditoria[]> {
    return this.getAuditLogs({ entidad });
  }

  /**
   * Obtener logs en rango de fechas
   */
  getLogsByDateRange(desde: string, hasta: string): Observable<LogAuditoria[]> {
    return this.getAuditLogs({ fecha_desde: desde, fecha_hasta: hasta });
  }

  /**
   * Formatear fecha para mostrar
   */
  formatFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Obtener acciones únicas (para filtros)
   */
  getAccionesDisponibles(): string[] {
    return [
      'CREAR_EMPRESA_CON_RRHH',
      'EDITAR_EMPRESA',
      'ELIMINAR_EMPRESA',
      'CREAR_CATALOGO',
      'EDITAR_CATALOGO',
      'ELIMINAR_CATALOGO',
    ];
  }

  /**
   * Obtener entidades únicas (para filtros)
   */
  getEntidadesDisponibles(): string[] {
    return [
      'Empresa',
      'CatalogoGlobal',
      'Usuario',
    ];
  }
}

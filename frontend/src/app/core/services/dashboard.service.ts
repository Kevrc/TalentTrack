import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardKpis {
  empresas_total: number;
  empresas_activas: number;
  empresas_inactivas: number;
  nuevas_mes: number;
  asistencia_promedio_global: number;
  actividad_promedio_diaria: number;
  eventos_totales_30d: number;
  empresas_con_eventos_30d: number;
  tendencia_total: number;
  tendencia_activas: number;
  tendencia_nuevas: number;
}

export interface EmpresasPorMes {
  periodo?: string; // formato YYYY-MM
  mes?: string; // formato DD/MM
  creadas: number;
  eliminadas: number;
}

export interface EmpresasPorMesPeriodo {
  periodo: string; // YYYY-MM
  datos: EmpresasPorMes[];
}

export interface EmpresasEstado {
  activas: number;
  inactivas: number;
}

export interface TopEmpresaActiva {
  empresa_id: string;
  nombre_comercial: string;
  total_eventos: number;
}

export interface EventoPorTipo {
  tipo: string;
  total: number;
}

export interface ActividadDiaria {
  fecha: string; // YYYY-MM-DD
  total: number;
}

export interface DashboardStatsResponse {
  kpis: DashboardKpis;
  empresas_por_mes: EmpresasPorMesPeriodo[];
  empresas_estado: EmpresasEstado;
  top_empresas_activas: TopEmpresaActiva[];
  eventos_por_tipo: EventoPorTipo[];
  actividad_diaria: ActividadDiaria[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/core/superadmin/dashboard/`;

  getStats(): Observable<DashboardStatsResponse> {
    return this.http.get<DashboardStatsResponse>(this.apiUrl);
  }
}

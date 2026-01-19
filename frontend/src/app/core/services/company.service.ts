import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Empresa {
  id?: string;
  razon_social: string;
  nombre_comercial: string;
  ruc_nit: string;
  pais: string | null;
  moneda: string | null;
  pais_nombre?: string;
  moneda_codigo?: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  sitio_web?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  logo_url?: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  creada_el?: string;
  admin_rrhh?: {
    email: string;
    primer_nombre: string;
    primer_apellido: string;
    segundo_apellido?: string;
    telefono?: string;
  };
}

export interface EmpresaCreate {
  razon_social: string;
  nombre_comercial: string;
  ruc_nit: string;
  pais: string | null;
  moneda: string | null;
  direccion?: string;
  telefono?: string;
  email?: string;
  sitio_web?: string;
  latitud?: number;
  longitud?: number;
  admin_rrhh_email: string;
  admin_rrhh_primer_nombre: string;
  admin_rrhh_primer_apellido: string;
  admin_rrhh_segundo_apellido?: string;
  admin_rrhh_telefono?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/core/superadmin/empresas`;

  /**
   * Obtener todas las empresas
   */
  getCompanies(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/`);
  }

  /**
   * Obtener una empresa por ID
   */
  getCompany(id: string): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}/`);
  }

  /**
   * Crear empresa con usuario RRHH
   */
  createCompany(data: EmpresaCreate): Observable<Empresa> {
    return this.http.post<Empresa>(`${this.apiUrl}/`, data);
  }

  /**
   * Actualizar empresa
   */
  updateCompany(id: string, data: Partial<Empresa>): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/${id}/`, data);
  }

  /**
   * Actualizar parcialmente empresa
   */
  patchCompany(id: string, data: Partial<Empresa>): Observable<Empresa> {
    return this.http.patch<Empresa>(`${this.apiUrl}/${id}/`, data);
  }

  /**
   * Eliminar empresa
   */
  deleteCompany(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  /**
   * Cambiar estado de empresa (activar/desactivar)
   */
  toggleStatus(id: string, estado: 'ACTIVO' | 'INACTIVO'): Observable<Empresa> {
    return this.http.patch<Empresa>(`${this.apiUrl}/${id}/`, { estado });
  }
}

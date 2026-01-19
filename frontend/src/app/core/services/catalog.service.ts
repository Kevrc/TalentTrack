import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CatalogoGlobal {
  id?: string;
  nombre: string;
  tipo: 'PAIS' | 'MONEDA';
  codigo: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/core/superadmin/catalogos`;

  /**
   * Obtener todos los catálogos
   */
  getCatalogos(): Observable<CatalogoGlobal[]> {
    return this.http.get<CatalogoGlobal[]>(`${this.apiUrl}/`);
  }

  /**
   * Obtener solo países
   */
  getPaises(): Observable<CatalogoGlobal[]> {
    return this.http.get<CatalogoGlobal[]>(`${this.apiUrl}/?tipo=PAIS`);
  }

  /**
   * Obtener solo monedas
   */
  getMonedas(): Observable<CatalogoGlobal[]> {
    return this.http.get<CatalogoGlobal[]>(`${this.apiUrl}/?tipo=MONEDA`);
  }

  /**
   * Obtener catálogo por ID
   */
  getCatalogo(id: string): Observable<CatalogoGlobal> {
    return this.http.get<CatalogoGlobal>(`${this.apiUrl}/${id}/`);
  }

  /**
   * Crear catálogo (país o moneda)
   */
  createCatalogo(data: CatalogoGlobal): Observable<CatalogoGlobal> {
    return this.http.post<CatalogoGlobal>(`${this.apiUrl}/`, data);
  }

  /**
   * Actualizar catálogo
   */
  updateCatalogo(id: string, data: Partial<CatalogoGlobal>): Observable<CatalogoGlobal> {
    return this.http.put<CatalogoGlobal>(`${this.apiUrl}/${id}/`, data);
  }

  /**
   * Eliminar catálogo
   */
  deleteCatalogo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  /**
   * Cambiar estado (activar/desactivar)
   */
  toggleActivo(id: string, activo: boolean): Observable<CatalogoGlobal> {
    return this.http.patch<CatalogoGlobal>(`${this.apiUrl}/${id}/`, { activo });
  }
}

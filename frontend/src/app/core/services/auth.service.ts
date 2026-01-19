import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap, switchMap } from 'rxjs';

interface TokenResponse {
  access: string;
  refresh: string;
}
export interface UserProfile {
  id: string;
  email: string;
  primer_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  telefono?: string;
  rol: 'SUPERADMIN' | 'RRHH' | 'MANAGER' | 'EMPLEADO';
  primer_login_completado: boolean;
  empleado_datos?: {
    nombres: string;
    apellidos: string;
    foto_url: string | null;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`; // http://localhost:8000/api

  currentUser = signal<UserProfile | null>(null);

  constructor() {
    if (this.getToken()) {
      this.getProfile().subscribe();
    }
  }

  login(credentials: { email: string; password: string }): Observable<UserProfile> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/token/`, credentials).pipe(
      tap((res) => this.saveToken(res.access)),
      // Una vez tenemos token, pedimos el perfil automáticamente
      switchMap(() => this.getProfile())
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/profile/`).pipe(
      tap((user) => this.currentUser.set(user)) // Guardamos en el signal
    );
  }

  completarPerfilInicial(datos: {
    primer_nombre: string;
    primer_apellido: string;
    segundo_apellido?: string;
    telefono?: string;
  }): Observable<any> {
    return this.http.post<{ detail: string; usuario: UserProfile }>(
      `${this.apiUrl}/users/profile/completar_perfil_inicial/`,
      datos
    ).pipe(
      tap((res) => {
        // Actualizar el usuario actual con los nuevos datos
        this.currentUser.set(res.usuario);
      })
    );
  }

  getUserRole(): string | null {
    return this.currentUser()?.rol || null;
  }

  isPrimerLogin(): boolean {
    return this.currentUser()?.primer_login_completado === false;
  }

  private saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}


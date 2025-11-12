import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.api}/auth/login/`, { username, password }).pipe(
      tap(res => {
        if (res && res.access) {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  profile(): Observable<any> {
    return this.http.get<any>(`${this.api}/auth/profile/`);
  }
}

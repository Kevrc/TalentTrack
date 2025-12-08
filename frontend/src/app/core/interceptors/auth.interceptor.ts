import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  // --- DEBUG LOGS ---
  console.log('Interceptor activo para URL:', req.url);
  console.log(
    'Token encontrado:',
    token ? 'SÍ (Empieza con ' + token.substring(0, 10) + '...)' : 'NO'
  );
  // ------------------
  if (token) {
    // Si hay token, clonamos la petición y le agregamos la cabecera
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  // Si no hay token, la dejamos pasar tal cual (ej: login)
  return next(req);
};

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service.js';
import { environment } from '../../../environments/environment';
import { NotificacionService } from '../ui/notificacion.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificaciones = inject(NotificacionService);
  const token = authService.getToken();
  const skipAuth = req.headers.get('X-Skip-Auth') === 'true';
  const suppressForbiddenAlert = req.headers.get('X-Suppress-Forbidden-Alert') === 'true';

  // Solo agregar JWT a requests del backend API.
  const isApiRequest = req.url.startsWith(environment.apiUrl);
  let internalHeaders = req.headers;
  if (internalHeaders.has('X-Skip-Auth')) {
    internalHeaders = internalHeaders.delete('X-Skip-Auth');
  }
  if (internalHeaders.has('X-Suppress-Forbidden-Alert')) {
    internalHeaders = internalHeaders.delete('X-Suppress-Forbidden-Alert');
  }
  const baseRequest = req.clone({ headers: internalHeaders });

  const request = isApiRequest && token && !skipAuth
    ? baseRequest.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : baseRequest;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 en una request autenticada = token vencido o inválido (no aplica al propio login)
      const esLogin = req.url.endsWith('/usuarios/login');
      if (error.status === 401 && !skipAuth && token && !esLogin) {
        authService.logout();
        router.navigate(['/login']);
        notificaciones.info('Tu sesión venció. Volvé a iniciar sesión.');
      }

      if (error.status === 403 && !skipAuth && !suppressForbiddenAlert) {
        notificaciones.error(error.error?.message ?? 'No tenés permisos para realizar esta acción.');
      }

      if (error.status === 0) {
        notificaciones.error('No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.');
      }

      return throwError(() => error);
    })
  );
};

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service.js';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
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
      if (error.status === 401 && !skipAuth) {
        authService.logout();
        router.navigate(['/login']);
      }

      if (error.status === 403 && !skipAuth && !suppressForbiddenAlert) {
        alert('No tienes permisos para realizar esta acción.');
      }

      return throwError(() => error);
    })
  );
};

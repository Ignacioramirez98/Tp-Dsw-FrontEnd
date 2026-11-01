import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Route, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { rutaInicio } from './roles';

function rolesDe(route: Route | { data?: Route['data'] }): string[] | undefined {
  return route.data?.['roles'] as string[] | undefined;
}

/**
 * canMatch: la ruta solo "existe" para los roles indicados en data.roles.
 * Si no coincide, el router prueba la siguiente ruta; así /ventas puede ser
 * el listado del personal o "Mis compras" del cliente según quién esté logueado.
 * Sin sesión, manda al login.
 */
export const rolesMatchGuard: CanMatchFn = (route): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const roles = rolesDe(route);
  return !roles || roles.includes(auth.getRol() ?? '');
};

/** canActivate equivalente, para rutas hijas dentro de un módulo. */
export const rolesActivateGuard: CanActivateFn = (route): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const roles = rolesDe(route);
  if (!roles || roles.includes(auth.getRol() ?? '')) {
    return true;
  }
  return router.createUrlTree([rutaInicio(auth.getRol())]);
};

/** El login solo se muestra sin sesión; con sesión, va a la pantalla de inicio del rol. */
export const invitadoGuard: CanMatchFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  if (!auth.isAuthenticated()) return true;

  // Una sesión con un rol desconocido (token viejo o corrupto) se descarta
  if (!ROLES_VALIDOS.includes(auth.getRol() ?? '')) {
    auth.logout();
    return true;
  }
  return inject(Router).createUrlTree([rutaInicio(auth.getRol())]);
};

const ROLES_VALIDOS = ['admin', 'vendedor', 'operario', 'cliente'];

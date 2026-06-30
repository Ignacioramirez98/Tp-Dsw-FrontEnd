import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);  // Redirigir al login si no está autenticado
      return false;
    }

    const allowedRoles = route.data?.['roles'] as string[] | undefined;
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const currentRole = (this.authService.getRol() || '').trim().toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((role) => role.trim().toLowerCase());
    if (currentRole && normalizedAllowedRoles.includes(currentRole)) {
      return true;
    }

    let fallbackRoute = '/cliente-dashboard';
    if (currentRole === 'vendedor' || currentRole === 'admin') {
      fallbackRoute = '/vendedor-dashboard';
    }
    if (currentRole === 'operario') {
      fallbackRoute = '/operarios';
    }

    // Evita loop si justo ya estamos intentando entrar al mismo fallback.
    if (state.url === fallbackRoute || !currentRole) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return false;
    }

    this.router.navigate([fallbackRoute]);
    return false;
  }
}

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

    const currentRole = this.authService.getRol();
    if (currentRole && allowedRoles.includes(currentRole)) {
      return true;
    }

    this.router.navigate(['/cliente-dashboard']);
    return false;
  }
}

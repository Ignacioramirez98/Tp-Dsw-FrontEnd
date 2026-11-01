import { Component } from '@angular/core';
import { AuthService, LoginResponse } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { rutaInicio } from '../../shared/auth/roles';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent {

  usuario: string = '';
  contrasena: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  private getTokenPayload(token: string): Record<string, any> | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  onLogin(): void {
    this.errorMessage = '';

    this.authService.login(this.usuario, this.contrasena).subscribe(
      (response: LoginResponse | any) => {
        const token = response?.token ?? response?.data?.token;

        if (!token) {
          this.errorMessage = 'La respuesta de login no incluyo token. Verifica el backend.';
          return;
        }

        const payload = this.getTokenPayload(token);
        const data = response?.data ?? {};
        const rolRaw = data?.rol ?? response?.rol ?? payload?.['rol'];
        const rol = String(rolRaw ?? '').trim().toLowerCase();
        const usuarioId = data?.usuarioId ?? payload?.['usuarioId'] ?? payload?.['id'] ?? '';
        const clienteId = data?.clienteId ?? response?.clienteId ?? payload?.['clienteId'] ?? '';
        const vendedorId = data?.vendedorId ?? response?.vendedorId ?? payload?.['vendedorId'] ?? '';
        const operarioId = data?.operarioId ?? response?.operarioId ?? payload?.['operarioId'] ?? '';
        const activo = data?.activo;

        if (!rol) {
          this.errorMessage = 'La respuesta de login no incluyo rol. Verifica el backend.';
          return;
        }

        if (activo === false) {
          this.errorMessage = 'Usuario desactivado.';
          return;
        }

        this.authService.saveToken(token);
        if (usuarioId) {
          this.authService.saveUsuarioId(usuarioId);
        }
        if (clienteId) {
          this.authService.saveCliente(clienteId);
        }
        if (vendedorId) {
          this.authService.saveVendedorId(vendedorId);
        }
        if (operarioId) {
          this.authService.saveOperarioId(operarioId);
        }
        this.authService.saveRol(rol);

        this.router.navigate([rutaInicio(rol)]);
      },
      (error) => {
        if (error?.status === 403) {
          this.errorMessage = 'Usuario desactivado.';
          return;
        }

        if (error?.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verificá que el backend esté levantado.';
          return;
        }

        this.errorMessage = error?.error?.message || 'Usuario o contraseña incorrectos';
      }
    );
  }
}

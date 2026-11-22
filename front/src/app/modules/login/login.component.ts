import { Component } from '@angular/core';
import { AuthService, LoginResponse } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { rutaInicio } from '../../shared/auth/roles';
import { mensajeDeErrorHttp } from '../../shared/utils/errores';

const MENSAJE_USUARIO_DESACTIVADO = 'Tu usuario está desactivado. Consultá con un administrador.';
const MENSAJE_SESION_FALLIDA = 'No pudimos iniciar tu sesión. Probá de nuevo en unos minutos.';

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
  /** Mientras espera la respuesta, el botón queda deshabilitado para no enviar dos veces. */
  enviando = false;

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
    if (this.enviando) return;
    this.errorMessage = '';
    this.enviando = true;

    this.authService.login(this.usuario, this.contrasena).pipe(finalize(() => (this.enviando = false))).subscribe({
      next: (response: LoginResponse | any) => {
        const token = response?.token ?? response?.data?.token;

        if (!token) {
          this.errorMessage = MENSAJE_SESION_FALLIDA;
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
          this.errorMessage = MENSAJE_SESION_FALLIDA;
          return;
        }

        if (activo === false) {
          this.errorMessage = MENSAJE_USUARIO_DESACTIVADO;
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
      error: (error) => {
        if (error?.status === 403) {
          this.errorMessage = MENSAJE_USUARIO_DESACTIVADO;
          return;
        }

        this.errorMessage = mensajeDeErrorHttp(error, 'Usuario o contraseña incorrectos');
      }
    });
  }
}

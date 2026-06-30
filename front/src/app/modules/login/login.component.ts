import { Component } from '@angular/core';
import { AuthService, LoginResponse } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  usuario: string = '';
  contrasena: string = '';
  errorMessage: string = '';
  rolPreview: string = 'invitado';

  constructor(private authService: AuthService, private router: Router) { }

  onRoleBadgeClick(role: string): void {
    this.errorMessage = `Rol actual: ${role}`;
  }

  onLogin(): void {
    this.authService.login(this.usuario, this.contrasena).subscribe(
      (response: LoginResponse) => {
        // Si el login es exitoso, guardar token, clienteId y rol
        const token = response.token;
        const clienteId = response.clienteId;
        const rol = response.rol;

        // Guardar credenciales en localStorage
        this.authService.saveToken(token);
        this.authService.saveCliente(clienteId);
        this.authService.saveRol(rol);
        this.rolPreview = rol;

        // Redirigir según el rol devuelto por el backend.
        if (rol === 'vendedor' || rol === 'admin') {
          this.router.navigate(['/vendedor-dashboard']);
        } else {
          this.router.navigate(['/cliente-dashboard']);
        }
      },
      () => {
        // Si hay un error, mostrar un mensaje
        this.errorMessage = 'Usuario o contraseña incorrectos';
      }
    );
  }
}

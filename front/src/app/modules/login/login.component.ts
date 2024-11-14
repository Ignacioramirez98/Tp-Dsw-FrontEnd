import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
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

  constructor(private authService: AuthService, private router: Router) { }

  onLogin(): void {
    this.authService.login(this.usuario, this.contrasena).subscribe(
      (response) => {
        // Si el login es exitoso, guardar el token y el clienteId
        const token = response.token;
        const clienteId = response.clienteId;

        // Guardar el token y el clienteId en localStorage
        this.authService.saveToken(token);
        this.authService.saveCliente(clienteId);

        // Redirigir a otra página después de login
        this.router.navigate(['/cliente-dashboard']);  // Cambia esta ruta si es necesario
      },
      (error) => {
        // Si hay un error, mostrar un mensaje
        this.errorMessage = 'Usuario o contraseña incorrectos';
      }
    );
  }
}

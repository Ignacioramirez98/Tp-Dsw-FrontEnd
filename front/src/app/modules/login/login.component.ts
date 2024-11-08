import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  usuario: string = '';
  password: string = '';
  userType: string = 'cliente'; // Por defecto, el tipo de usuario es cliente

  constructor(private loginService: LoginService, private router: Router) {}

  login() {
    this.loginService.login(this.usuario, this.password, this.userType).subscribe(
      (response) => {
        console.log('Inicio de sesión exitoso:', response);
        
        // Guardar el token en el localStorage
        if (response.token) {
          this.loginService.saveToken(response.token);
        }

        // Redirigir según el tipo de usuario
        if (this.userType === 'cliente') {
          this.router.navigate(['/cliente-dashboard']);
        } else {
          this.router.navigate(['/vendedor-dashboard']);
        }
      },
      (error) => {
        console.error('Error al iniciar sesión', error);
        // Aquí puedes manejar el error y mostrar un mensaje al usuario
      }
    );
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service.js'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  userType: string = 'cliente'; // Por defecto, el tipo de usuario es cliente

  constructor(private loginsevice: LoginService, private router: Router) {}

  login() {
    this.loginsevice.login(this.email, this.password, this.userType).subscribe(
      (response) => {
        console.log('Inicio de sesión exitoso:', response);
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


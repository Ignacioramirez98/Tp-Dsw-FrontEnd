import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service.js';  // Asegúrate de importar el AuthService correctamente


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone : false
})
export class HeaderComponent {
  
  constructor(private authService: AuthService, private router: Router) {}

  // Método para cerrar sesión
  cerrarSesion(): void {
    // Llamamos al servicio de autenticación para eliminar los datos
    this.authService.logout();
    // Redirigimos al usuario a la página de login
    this.router.navigate(['/login']);
  }
}

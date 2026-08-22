import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VendedorDashboardService } from './vendedor-dashboard.service.js';
import { AuthService } from '../../../shared/services/auth.service.js';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vendedor-dashboard',
  templateUrl: './vendedor-dashboard.component.html',
  styleUrls: ['./vendedor-dashboard.component.css'],
  standalone : false
})
export class VendedorDashboardComponent {
  readonly dashboardImages = {
    productos: `${environment.apiUrl}/uploads/productos.jpg`,
    servicios: `${environment.apiUrl}/uploads/servicios.avif`,
    ventas: `${environment.apiUrl}/uploads/ventas.webp`
  };

  constructor(
    private clientedashboardservice: VendedorDashboardService,
    private router: Router,
    private authService: AuthService
  ) {}

  get isAdmin(): boolean {
    return (this.authService.getRol() || '').trim().toLowerCase() === 'admin';
  }
}

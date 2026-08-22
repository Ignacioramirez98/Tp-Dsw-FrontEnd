import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VendedorDashboardService } from './vendedor-dashboard.service.js';
import { AuthService } from '../../../shared/services/auth.service.js';
import { environment } from '../../../../environments/environment';

interface DashboardCard {
  title: string;
  description: string;
  imageUrl: string;
  route: string;
  linkText: string;
  roles: string[];
}

@Component({
  selector: 'app-vendedor-dashboard',
  templateUrl: './vendedor-dashboard.component.html',
  styleUrls: ['./vendedor-dashboard.component.css'],
  standalone : false
})
export class VendedorDashboardComponent {
  readonly dashboardCards: DashboardCard[] = [
    {
      title: 'Productos',
      description: 'Explora nuestra amplia gama de productos disponibles para ti.',
      imageUrl: `${environment.apiUrl}/uploads/productos.jpg`,
      route: '/productos',
      linkText: 'Ver Productos',
      roles: ['admin']
    },
    {
      title: 'Servicios',
      description: 'Descubre los servicios que ofrecemos para mejorar tu experiencia.',
      imageUrl: `${environment.apiUrl}/uploads/servicios.avif`,
      route: '/servicios',
      linkText: 'Ver Servicios',
      roles: ['admin', 'operario']
    },
    {
      title: 'Ventas',
      description: 'Gestiona y consulta el historial de ventas realizadas.',
      imageUrl: `${environment.apiUrl}/uploads/ventas.webp`,
      route: '/ventas',
      linkText: 'Ver Ventas',
      roles: ['admin', 'vendedor']
    },
    {
      title: 'Clientes',
      description: 'Accede a la informacion de nuestros clientes.',
      imageUrl: 'assets/images/clientes.jpg',
      route: '/clientes',
      linkText: 'Ver Clientes',
      roles: ['admin', 'vendedor', 'operario']
    },
    {
      title: 'Localidades',
      description: 'Consulta las localidades en las que operamos.',
      imageUrl: 'assets/images/localidades.jpg',
      route: '/localidades',
      linkText: 'Ver Localidades',
      roles: ['admin']
    },
    {
      title: 'Operarios',
      description: 'Gestiona la informacion de los operarios en el sistema.',
      imageUrl: 'assets/images/operarios.jpg',
      route: '/operarios',
      linkText: 'Ver Operarios',
      roles: ['admin']
    }
  ];

  constructor(
    private clientedashboardservice: VendedorDashboardService,
    private router: Router,
    private authService: AuthService
  ) {}

  get visibleDashboardCards(): DashboardCard[] {
    const role = (this.authService.getRol() || '').trim().toLowerCase();
    return this.dashboardCards.filter((card) => card.roles.includes(role));
  }
}

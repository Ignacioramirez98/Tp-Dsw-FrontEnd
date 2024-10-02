import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteDashboardService } from './cliente.dashboard.service.js'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-cliente-dashboard',
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.css'],
})
export class ClienteDashboardComponent {

  constructor(private clientedashboardservice: ClienteDashboardService, private router: Router) {}

}
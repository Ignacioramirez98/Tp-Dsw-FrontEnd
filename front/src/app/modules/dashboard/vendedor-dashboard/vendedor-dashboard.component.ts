import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VendedorDashboardService } from './vendedor-dashboard.service.js';

@Component({
  selector: 'app-vendedor-dashboard',
  templateUrl: './vendedor-dashboard.component.html',
  styleUrls: ['./vendedor-dashboard.component.css'],
  standalone : false
})
export class VendedorDashboardComponent {
  constructor(private clientedashboardservice: VendedorDashboardService, private router: Router) {}
}

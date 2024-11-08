import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteDashboardService } from './cliente.dashboard.service';

@Component({
  selector: 'app-cliente-dashboard',
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.css'],
  standalone : false
})
export class ClienteDashboardComponent {
  constructor(private clientedashboardservice: ClienteDashboardService, private router: Router) {}
}

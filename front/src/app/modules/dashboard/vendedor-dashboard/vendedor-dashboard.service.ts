import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VendedorDashboardService {
  private apiUrl = 'http://localhost:3000/vendedor-dashboard';

  constructor(private http: HttpClient) {}

}
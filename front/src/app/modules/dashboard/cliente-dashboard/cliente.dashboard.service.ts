import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClienteDashboardService {
  private apiUrl = 'http://localhost:3000/cliente-dashboard';

  constructor(private http: HttpClient) {}

}
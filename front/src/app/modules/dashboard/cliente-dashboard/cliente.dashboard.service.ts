import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClienteDashboardService {
  private apiUrl = `${environment.apiUrl}/cliente-dashboard`;

  constructor(private http: HttpClient) {}

}
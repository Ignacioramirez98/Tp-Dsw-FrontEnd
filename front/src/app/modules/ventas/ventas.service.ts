import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta } from '../../shared/models/venta.model.js';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private apiUrl = 'http://localhost:3000/ventas'; // URL base del backend

  constructor(private http: HttpClient) {}

  crearVenta(venta: Venta): Observable<any> {
    return this.http.post<any>(this.apiUrl, venta);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta } from '../../shared/models/venta.model.js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private apiUrl = `${environment.apiUrl}/ventas`; // URL base del backend

  constructor(private http: HttpClient) {}

  crearVenta(venta: Venta): Observable<any> {
    return this.http.post<any>(this.apiUrl, venta);
  }

    // Obtener todos los Ventas desde la API
  // Filtros opcionales que resuelve el backend: estado, clienteId, vendedorId
  getVentas(filtros: { estado?: string; clienteId?: string; vendedorId?: string } = {}): Observable<{ data: Venta[] }> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor) params = params.set(clave, valor);
    }
    return this.http.get<{ data: Venta[] }>(this.apiUrl, { params });
  }

    // Eliminar un producto por su ID
  deleteVenta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

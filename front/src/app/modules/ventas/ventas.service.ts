import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FiltrosVenta, Venta, VentaPayload } from '../../shared/models/venta.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  /** Lista de ventas (la más nueva primero). Los filtros los resuelve el backend. */
  getVentas(filtros: FiltrosVenta = {}): Observable<{ data: Venta[] }> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor) params = params.set(clave, valor);
    }
    return this.http.get<{ data: Venta[] }>(this.apiUrl, { params });
  }

  getVenta(id: string): Observable<{ data: Venta }> {
    return this.http.get<{ data: Venta }>(`${this.apiUrl}/${id}`);
  }

  crearVenta(venta: VentaPayload | Venta): Observable<{ data: Venta }> {
    return this.http.post<{ data: Venta }>(this.apiUrl, venta);
  }

  actualizarVenta(id: string, cambios: VentaPayload): Observable<{ data: Venta }> {
    return this.http.patch<{ data: Venta }>(`${this.apiUrl}/${id}`, cambios);
  }

  /** CUU Concretar Venta: descuenta stock y la deja a nombre del vendedor. */
  concretar(id: string, datos: { vendedorId?: string; fechaEntrega?: string | null } = {}): Observable<{ data: Venta }> {
    return this.http.post<{ data: Venta }>(`${this.apiUrl}/${id}/concretar`, datos);
  }

  /** Cancela la venta (si estaba concretada, el backend devuelve el stock). */
  cancelar(id: string): Observable<{ data: Venta }> {
    return this.http.post<{ data: Venta }>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  deleteVenta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

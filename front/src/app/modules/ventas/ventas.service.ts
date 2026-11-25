import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Factura } from '../../shared/models/factura.model';
import { FiltrosVenta, RespuestaVenta, Venta, VentaPayload } from '../../shared/models/venta.model';
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

  /** Si la crea un cliente, el back le manda el mail "Recibimos tu pedido" (ver `notificacion`). */
  crearVenta(venta: VentaPayload | Venta): Observable<RespuestaVenta> {
    return this.http.post<RespuestaVenta>(this.apiUrl, venta);
  }

  actualizarVenta(id: string, cambios: VentaPayload): Observable<{ data: Venta }> {
    return this.http.patch<{ data: Venta }>(`${this.apiUrl}/${id}`, cambios);
  }

  /** CUU Concretar Venta: descuenta stock y la deja a nombre del vendedor. */
  concretar(
    id: string,
    datos: { vendedorId?: string; fechaEntrega?: string | null; notificarCliente?: boolean } = {},
  ): Observable<RespuestaVenta> {
    return this.http.post<RespuestaVenta>(`${this.apiUrl}/${id}/concretar`, datos);
  }

  /** Cancela la venta (si estaba concretada, el backend devuelve el stock). */
  cancelar(id: string, notificarCliente = true): Observable<RespuestaVenta> {
    return this.http.post<RespuestaVenta>(`${this.apiUrl}/${id}/cancelar`, { notificarCliente });
  }

  /**
   * CUU Realizar facturación: emite la factura de una venta concretada (la venta pasa a facturada
   * y ya no se puede cancelar). Responde 409 si no está concretada o ya tiene factura.
   */
  facturar(id: string): Observable<{ data: Factura }> {
    return this.http.post<{ data: Factura }>(`${this.apiUrl}/${id}/facturar`, {});
  }

  deleteVenta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

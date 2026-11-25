import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Factura, FiltrosFactura } from '../../shared/models/factura.model';
import { environment } from '../../../environments/environment';

/**
 * Consulta de facturas. Se emiten con `VentasService.facturar` y no se editan ni se borran.
 * El token lo agrega el interceptor; el cliente recibe solo las suyas.
 */
@Injectable({ providedIn: 'root' })
export class FacturasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/facturas`;

  /** Lista de facturas (la más nueva primero). Los filtros los resuelve el backend. */
  getFacturas(filtros: FiltrosFactura = {}): Observable<{ data: Factura[] }> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor) params = params.set(clave, valor);
    }
    return this.http.get<{ data: Factura[] }>(this.apiUrl, { params });
  }

  getFactura(id: string): Observable<{ data: Factura }> {
    return this.http.get<{ data: Factura }>(`${this.apiUrl}/${id}`);
  }

  /** La factura de una venta ya facturada (404 si todavía no tiene). */
  getFacturaDeVenta(ventaId: string): Observable<{ data: Factura }> {
    return this.http.get<{ data: Factura }>(`${environment.apiUrl}/ventas/${ventaId}/factura`);
  }
}

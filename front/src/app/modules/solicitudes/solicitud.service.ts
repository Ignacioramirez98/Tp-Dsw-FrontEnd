import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FiltrosSolicitud, SolicitudPayload, SolicitudServicio } from '../../shared/models/solicitud-servicio.model';
import { environment } from '../../../environments/environment';

/** Acceso a /solicitudes-servicio (CUU Solicitar Servicio). El token lo agrega el interceptor. */
@Injectable({ providedIn: 'root' })
export class SolicitudesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/solicitudes-servicio`;

  /** Lista de solicitudes (la más nueva primero). Cada rol recibe solo las suyas; los filtros los resuelve el backend. */
  getSolicitudes(filtros: FiltrosSolicitud = {}): Observable<{ data: SolicitudServicio[] }> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor) params = params.set(clave, valor);
    }
    return this.http.get<{ data: unknown[] }>(this.apiUrl, { params }).pipe(
      map((r) => ({ data: (r.data ?? []).map((s) => this.normalizar(s)) })),
    );
  }

  getSolicitud(id: string): Observable<{ data: SolicitudServicio }> {
    return this.http.get<{ data: unknown }>(`${this.apiUrl}/${id}`).pipe(map((r) => ({ data: this.normalizar(r.data) })));
  }

  /** El cliente pide un servicio: nace pendiente y a su nombre. */
  crear(solicitud: SolicitudPayload): Observable<{ data: SolicitudServicio }> {
    return this.http.post<{ data: unknown }>(this.apiUrl, solicitud).pipe(map((r) => ({ data: this.normalizar(r.data) })));
  }

  /** Un operario se hace cargo. Solo el admin indica `operarioId` (si no, la acepta a su nombre el operario logueado). */
  aceptar(id: string, operarioId?: string): Observable<{ data: SolicitudServicio }> {
    return this.http.post<{ data: unknown }>(`${this.apiUrl}/${id}/aceptar`, operarioId ? { operarioId } : {}).pipe(
      map((r) => ({ data: this.normalizar(r.data) })),
    );
  }

  /** Registra el trabajo hecho; sin `horasReales` el backend usa las estimadas. */
  finalizar(id: string, horasReales?: number): Observable<{ data: SolicitudServicio }> {
    return this.http.post<{ data: unknown }>(`${this.apiUrl}/${id}/finalizar`, horasReales ? { horasReales } : {}).pipe(
      map((r) => ({ data: this.normalizar(r.data) })),
    );
  }

  /** Cancela la solicitud; el motivo es opcional. */
  cancelar(id: string, motivo?: string): Observable<{ data: SolicitudServicio }> {
    return this.http.post<{ data: unknown }>(`${this.apiUrl}/${id}/cancelar`, motivo ? { motivo } : {}).pipe(
      map((r) => ({ data: this.normalizar(r.data) })),
    );
  }

  /** La API puede devolver `id` en lugar de `_id`: el resto de la app usa siempre `_id`. */
  private normalizar(respuesta: unknown): SolicitudServicio {
    const s = respuesta as SolicitudServicio & { id?: string };
    return { ...s, _id: s._id || s.id || '' };
  }
}

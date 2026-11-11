import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Servicio } from '../../shared/models/servicio.model.js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  private apiUrl = `${environment.apiUrl}/servicios`; // URL de tu API

  constructor(private http: HttpClient) {}

  // Obtener todos los servicios desde la API
  // Filtros opcionales que resuelve el backend: descripcion, operarioId
  getServicios(filtros: { descripcion?: string; operarioId?: string } = {}): Observable<{ data: Servicio[] }> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor) params = params.set(clave, valor);
    }
    return this.http.get<unknown>(this.apiUrl, { params }).pipe(
      map((response) => this.normalizarRespuestaServicios(response))
    );
  }

  private normalizarServicio(response: unknown): Servicio {
    const servicio = response as Servicio & { id?: string };
    return { ...servicio, _id: servicio._id || servicio.id || '' };
  }

  private normalizarRespuestaServicios(response: unknown): { data: Servicio[] } {
    const respuesta = response as { data?: unknown; servicios?: unknown };
    const servicios = Array.isArray(response)
      ? response
      : Array.isArray(respuesta?.data)
        ? respuesta.data
        : Array.isArray(respuesta?.servicios)
          ? respuesta.servicios
          : [];

    return { data: servicios.map((servicio) => this.normalizarServicio(servicio)) };
  }

  // Obtener un servicio por su ID
  getServicio(id: string): Observable<Servicio> {
    return this.http.get<unknown>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        const respuesta = response as { data?: unknown };
        return this.normalizarServicio(respuesta?.data ?? response);
      })
    );
  }

  // Crear un nuevo servicio en la API
  addServicio(servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(this.apiUrl, servicio);
  }

  // Crear servicio (multipart/form-data, con imagen opcional). El token lo agrega el interceptor.
  crearServicio(formData: FormData): Observable<Servicio> {
    return this.http.post<Servicio>(this.apiUrl, formData);
  }

  // Actualizar un servicio existente, con una nueva imagen opcional.
  updateServicio(id: string, formData: FormData): Observable<Servicio> {
    return this.http.put<unknown>(`${this.apiUrl}/${id}`, formData).pipe(
      map((response) => {
        const respuesta = response as { data?: unknown };
        return this.normalizarServicio(respuesta?.data ?? response);
      })
    );
  }

  // Eliminar un servicio por su ID
  deleteServicio(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

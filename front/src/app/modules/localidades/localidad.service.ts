import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Localidad } from '../../shared/models/localidad.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocalidadesService {
  private apiUrl = `${environment.apiUrl}/localidades`;

  constructor(private http: HttpClient) {}

  // Obtener todas las localidades desde la API
  getLocalidades(): Observable<{ data: Localidad[] }> {
    return this.http.get<{ data: Localidad[] }>(this.apiUrl);
  }

  // Obtener una localidad por su ID
  getLocalidad(id: string): Observable<{ data: Localidad }> {
    return this.http.get<{ data: Localidad }>(`${this.apiUrl}/${id}`);
  }

  // Crear una nueva localidad en la API
  addLocalidad(localidad: Localidad): Observable<{ data: Localidad }> {
    return this.http.post<{ data: Localidad }>(this.apiUrl, localidad);
  }

  // Actualizar una localidad existente en la API
  updateLocalidad(localidad: Localidad): Observable<{ data: Localidad }> {
    return this.http.put<{ data: Localidad }>(`${this.apiUrl}/${localidad._id}`, localidad);
  }

  // Eliminar una localidad por su ID
  deleteLocalidad(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

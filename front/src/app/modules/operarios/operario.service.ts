import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Operario } from '../../shared/models/operario.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OperariosService {
  private apiUrl = `${environment.apiUrl}/operarios`;

  constructor(private http: HttpClient) {}

  // Obtener todos los operarios desde la API
  getOperarios(): Observable<{ data: Operario[] }> {
    return this.http.get<{ data: Operario[] }>(this.apiUrl);
  }

  // Obtener un operario por su ID
  getOperario(id: string): Observable<{ data: Operario }> {
    return this.http.get<{ data: Operario }>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo operario en la API
  addOperario(operario: Operario): Observable<{ data: Operario }> {
    return this.http.post<{ data: Operario }>(this.apiUrl, operario);
  }

  // Actualizar un operario existente en la API
  updateOperario(operario: Operario): Observable<{ data: Operario }> {
    return this.http.put<{ data: Operario }>(`${this.apiUrl}/${operario._id}`, operario);
  }

  // Eliminar un operario por su ID
  deleteOperario(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

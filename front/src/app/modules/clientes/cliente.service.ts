import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../../shared/models/cliente.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  // Obtener todos los clientes desde la API
  getClientes(): Observable<{ data: Cliente[] }> {
    return this.http.get<{ data: Cliente[] }>(this.apiUrl);
  }

  // Obtener un cliente por su ID
  getCliente(id: string): Observable<{ data: Cliente }> {
    return this.http.get<{ data: Cliente }>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo cliente en la API
  addCliente(cliente: Cliente): Observable<{ data: Cliente }> {
    return this.http.post<{ data: Cliente }>(this.apiUrl, cliente);
  }

  // Actualizar un cliente existente en la API
  updateCliente(cliente: Cliente): Observable<{ data: Cliente }> {
    return this.http.put<{ data: Cliente }>(`${this.apiUrl}/${cliente._id}`, cliente);
  }

  // Eliminar un cliente por su ID
  deleteCliente(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

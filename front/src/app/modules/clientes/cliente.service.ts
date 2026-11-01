import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  // Filtros opcionales que resuelve el backend: apellido, dni, localidadId
  getClientes(filtros: { apellido?: string; dni?: string; localidadId?: string } = {}): Observable<{ data: Cliente[] }> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor) params = params.set(clave, valor);
    }
    return this.http.get<{ data: Cliente[] }>(this.apiUrl, { params });
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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vendedor } from '../../shared/models/vendedor.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VendedoresService {
  private apiUrl = `${environment.apiUrl}/vendedores`;

  constructor(private http: HttpClient) {}

  // Obtener todos los vendedores desde la API
  getVendedores(): Observable<{ data: Vendedor[] }> {
    return this.http.get<{ data: Vendedor[] }>(this.apiUrl);
  }

  // Obtener un vendedor por su ID
  getVendedor(id: string): Observable<{ data: Vendedor }> {
    return this.http.get<{ data: Vendedor }>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo vendedor en la API
  addVendedor(vendedor: Vendedor): Observable<{ data: Vendedor }> {
    return this.http.post<{ data: Vendedor }>(this.apiUrl, vendedor);
  }

  // Actualizar un vendedor existente en la API
  updateVendedor(vendedor: Vendedor): Observable<{ data: Vendedor }> {
    return this.http.put<{ data: Vendedor }>(`${this.apiUrl}/${vendedor._id}`, vendedor);
  }

  // Eliminar un vendedor por su ID
  deleteVendedor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

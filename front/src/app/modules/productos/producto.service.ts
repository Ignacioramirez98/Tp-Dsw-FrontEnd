import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../../shared/models/producto.model.js';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = 'http://localhost:3000/productos';  // Reemplaza con tu URL de API

  constructor(private http: HttpClient) {}

  getProductos(): Observable<{ data: Producto[] }> {
    return this.http.get<{ data: Producto[] }>(this.apiUrl);
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  addProducto(Producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, Producto);
  }

  updateProducto(Producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${Producto.id}`, Producto);
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../../shared/models/producto.model.js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = `${environment.apiUrl}/productos`; // URL de tu API

  constructor(private http: HttpClient) {}

  // Obtener todos los productos desde la API
  getProductos(): Observable<{ data: Producto[] }> {
    return this.http.get<unknown>(this.apiUrl).pipe(
      map((response) => this.normalizarRespuestaProductos(response))
    );
  }

  private normalizarProducto(response: unknown): Producto {
    const producto = response as Producto & { id?: string };
    return { ...producto, _id: producto._id || producto.id || '' };
  }

  private normalizarRespuestaProductos(response: unknown): { data: Producto[] } {
    const respuesta = response as { data?: unknown; productos?: unknown };
    const productos = Array.isArray(response)
      ? response
      : Array.isArray(respuesta?.data)
        ? respuesta.data
        : Array.isArray(respuesta?.productos)
          ? respuesta.productos
          : [];

    return { data: productos.map((producto) => this.normalizarProducto(producto)) };
  }

  // Obtener un producto por su ID
  getProducto(id: string): Observable<Producto> {
    return this.http.get<unknown>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        const respuesta = response as { data?: unknown };
        return this.normalizarProducto(respuesta?.data ?? response);
      })
    );
  }

  // Crear un nuevo producto en la API
  addProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  // Crear producto (multipart/form-data, con imagen opcional). El token lo agrega el interceptor.
  crearProducto(formData: FormData): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, formData);
  }

  // Actualizar un producto existente, con una nueva imagen opcional.
  updateProducto(id: string, formData: FormData): Observable<Producto> {
    return this.http.put<unknown>(`${this.apiUrl}/${id}`, formData).pipe(
      map((response) => {
        const respuesta = response as { data?: unknown };
        return this.normalizarProducto(respuesta?.data ?? response);
      })
    );
  }

  // Eliminar un producto por su ID
  deleteProducto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

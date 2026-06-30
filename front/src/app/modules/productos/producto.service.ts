import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Producto } from '../../shared/models/producto.model.js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = `${environment.apiUrl}/productos`; // URL de tu API
  private productosSeleccionados: Producto[] = [];
  private cantidades: { [id: string]: number } = {}; // Almacena las cantidades de cada producto seleccionado

  constructor(private http: HttpClient) {
    this.cargarProductosDesdeStorage();  // Cargar los productos desde localStorage al inicializar el servicio
  }

  // Obtener todos los productos desde la API
  getProductos(): Observable<{ data: Producto[] }> {
    return this.http.get<{ data: Producto[] }>(this.apiUrl);
  }

  private normalizarRespuestaProductos(response: any): { data: Producto[] } {
    if (Array.isArray(response)) {
      return { data: response as Producto[] };
    }

    if (Array.isArray(response?.data)) {
      return { data: response.data as Producto[] };
    }

    if (Array.isArray(response?.productos)) {
      return { data: response.productos as Producto[] };
    }

    return { data: [] };
  }

  // Catalogo para compra: evita enviar Authorization para no heredar permisos de gestion.
  getProductosCatalogo(): Observable<{ data: Producto[] }> {
    const headers = new HttpHeaders({ 'X-Skip-Auth': 'true' });
    return this.http.get<{ data: Producto[] }>(this.apiUrl, { headers });
  }

  // Fallback de compra: usa JWT pero evita alert global de 403 en cliente.
  getProductosCatalogoAutenticado(): Observable<{ data: Producto[] }> {
    const headers = new HttpHeaders({ 'X-Suppress-Forbidden-Alert': 'true' });
    return this.http.get<{ data: Producto[] }>(this.apiUrl, { headers });
  }

  // Flujo robusto para compra:
  // 1) /productos/catalogo sin auth
  // 2) /productos sin auth
  // 3) /productos con auth (silencioso para 403)
  getProductosParaCompra(): Observable<{ data: Producto[] }> {
    const publicHeaders = new HttpHeaders({
      'X-Skip-Auth': 'true',
      'X-Suppress-Forbidden-Alert': 'true'
    });
    const authHeaders = new HttpHeaders({ 'X-Suppress-Forbidden-Alert': 'true' });

    return this.http.get<any>(`${this.apiUrl}/catalogo`, { headers: publicHeaders }).pipe(
      map((response) => this.normalizarRespuestaProductos(response)),
      catchError(() => this.http.get<any>(this.apiUrl, { headers: publicHeaders }).pipe(
        map((response) => this.normalizarRespuestaProductos(response)),
        catchError(() => this.http.get<any>(this.apiUrl, { headers: authHeaders }).pipe(
          map((response) => this.normalizarRespuestaProductos(response))
        ))
      ))
    );
  }

  // Obtener un producto por su ID
  getProducto(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo producto en la API
  addProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  // Crear producto con imagen multipart/form-data.
  crearProductoConImagen(formData: FormData, token: string): Observable<Producto> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<Producto>(this.apiUrl, formData, { headers });
  }

  // Actualizar un producto existente en la API
  updateProducto(producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${producto._id}`, producto);
  }

  // Eliminar un producto por su ID
  deleteProducto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Agregar o actualizar un producto seleccionado junto con su cantidad
  setProductoSeleccionado(producto: Producto, cantidad: number): void {
    const index = this.productosSeleccionados.findIndex(p => p._id === producto._id);
    if (cantidad === 0 && index > -1) {
      // Si la cantidad es 0 y el producto está en la lista, lo eliminamos
      this.productosSeleccionados.splice(index, 1);
      delete this.cantidades[producto._id]; // Eliminar la cantidad de la lista
    } else if (index > -1) {
      // Si el producto ya está seleccionado, solo actualizamos la cantidad
      this.cantidades[producto._id] = cantidad;
    } else {
      // Si el producto no estaba seleccionado, lo agregamos a la lista
      this.productosSeleccionados.push(producto);
      this.cantidades[producto._id] = cantidad;
    }
    this.actualizarProductosEnStorage();  // Actualizamos el localStorage cada vez que se modifica el estado
  }

  // Obtener los productos seleccionados
  getProductosSeleccionados(): Producto[] {
    return this.productosSeleccionados;
  }

  // Obtener las cantidades de los productos seleccionados
  getCantidades(): { [id: string]: number } {
    return this.cantidades;
  }

  // Obtener la cantidad de un producto específico
  getCantidadPorProducto(producto: Producto): number {
    return this.cantidades[producto._id] || 0;  // Devuelve 0 si no se ha seleccionado
  }

  // Guardar los productos seleccionados y sus cantidades en localStorage
  private actualizarProductosEnStorage(): void {
    localStorage.setItem('productosSeleccionados', JSON.stringify(this.productosSeleccionados));
    localStorage.setItem('cantidadesSeleccionadas', JSON.stringify(this.cantidades));
  }

  // Cargar los productos y cantidades desde localStorage
  private cargarProductosDesdeStorage(): void {
    const productosGuardados = localStorage.getItem('productosSeleccionados');
    const cantidadesGuardadas = localStorage.getItem('cantidadesSeleccionadas');

    if (productosGuardados && cantidadesGuardadas) {
      this.productosSeleccionados = JSON.parse(productosGuardados);
      this.cantidades = JSON.parse(cantidadesGuardadas);
    }
  }

  // Limpiar los productos seleccionados y cantidades del localStorage (si es necesario)
  limpiarProductosSeleccionados(): void {
    this.productosSeleccionados = [];
    this.cantidades = {};
    localStorage.removeItem('productosSeleccionados');
    localStorage.removeItem('cantidadesSeleccionadas');
  }
}

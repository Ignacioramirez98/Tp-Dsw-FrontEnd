import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../../shared/models/producto.model.js';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = 'http://localhost:3000/productos'; // URL de tu API
  private productosSeleccionados: Producto[] = [];
  private cantidades: { [id: string]: number } = {}; // Almacena las cantidades de cada producto seleccionado

  constructor(private http: HttpClient) {
    this.cargarProductosDesdeStorage();  // Cargar los productos desde localStorage al inicializar el servicio
  }

  // Obtener todos los productos desde la API
  getProductos(): Observable<{ data: Producto[] }> {
    return this.http.get<{ data: Producto[] }>(this.apiUrl);
  }

  // Obtener un producto por su ID
  getProducto(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo producto en la API
  addProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
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

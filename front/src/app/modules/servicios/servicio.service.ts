import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servicio } from '../../shared/models/servicio.model.js';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  private apiUrl = 'http://localhost:3000/servicios'; // URL de tu API
  private serviciosSeleccionados: Servicio[] = [];
  private cantidades: { [id: string]: number } = {}; // Almacena las cantidades de cada servicio seleccionado

  constructor(private http: HttpClient) {
    this.cargarServiciosDesdeStorage();  // Cargar los servicios desde localStorage al inicializar el servicio
  }

  // Obtener todos los servicios desde la API
  getServicios(): Observable<{ data: Servicio[] }> {
    return this.http.get<{ data: Servicio[] }>(this.apiUrl);
  }

  // Obtener un servicio por su ID
  getServicio(id: string): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo servicio en la API
  addServicio(servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(this.apiUrl, servicio);
  }

  // Actualizar un servicio existente en la API
  updateServicio(servicio: Servicio): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.apiUrl}/${servicio._id}`, servicio);
  }

  // Eliminar un servicio por su ID
  deleteServicio(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Agregar o actualizar un servicio seleccionado junto con su cantidad
  setServicioseleccionado(servicio: Servicio, cantidad: number): void {
    const index = this.serviciosSeleccionados.findIndex(p => p._id === servicio._id);
    if (cantidad === 0 && index > -1) {
      // Si la cantidad es 0 y el servicio está en la lista, lo eliminamos
      this.serviciosSeleccionados.splice(index, 1);
      delete this.cantidades[servicio._id]; // Eliminar la cantidad de la lista
    } else if (index > -1) {
      // Si el servicio ya está seleccionado, solo actualizamos la cantidad
      this.cantidades[servicio._id] = cantidad;
    } else {
      // Si el servicio no estaba seleccionado, lo agregamos a la lista
      this.serviciosSeleccionados.push(servicio);
      this.cantidades[servicio._id] = cantidad;
    }
    this.actualizarServiciosEnStorage();  // Actualizamos el localStorage cada vez que se modifica el estado
  }

  // Obtener los servicios seleccionados
  getServiciosSeleccionados(): Servicio[] {
    return this.serviciosSeleccionados;
  }

  // Obtener las cantidades de los servicios seleccionados
  getCantidades(): { [id: string]: number } {
    return this.cantidades;
  }

  // Obtener la cantidad de un servicio específico
  getCantidadPorservicio(servicio: Servicio): number {
    return this.cantidades[servicio._id] || 0;  // Devuelve 0 si no se ha seleccionado
  }

  // Guardar los servicios seleccionados y sus cantidades en localStorage
  private actualizarServiciosEnStorage(): void {
    localStorage.setItem('serviciosSeleccionados', JSON.stringify(this.serviciosSeleccionados));
    localStorage.setItem('cantidadesSeleccionadas', JSON.stringify(this.cantidades));
  }

  // Cargar los servicios y cantidades desde localStorage
  private cargarServiciosDesdeStorage(): void {
    const serviciosGuardados = localStorage.getItem('serviciosSeleccionados');
    const cantidadesGuardadas = localStorage.getItem('cantidadesSeleccionadas');

    if (serviciosGuardados && cantidadesGuardadas) {
      this.serviciosSeleccionados = JSON.parse(serviciosGuardados);
      this.cantidades = JSON.parse(cantidadesGuardadas);
    }
  }

  // Limpiar los servicios seleccionados y cantidades del localStorage (si es necesario)
  limpiarServiciosSeleccionados(): void {
    this.serviciosSeleccionados = [];
    this.cantidades = {};
    localStorage.removeItem('serviciosSeleccionados');
    localStorage.removeItem('cantidadesSeleccionadas');
  }
}

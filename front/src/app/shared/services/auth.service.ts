import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/clientes';  // URL base ajustada

  constructor(private http: HttpClient) { }

  // Método para hacer login
  login(usuario: string, contraseña: string): Observable<any> {
    const body = { usuario, contraseña };
    return this.http.post(`${this.apiUrl}/login`, body);  // Ajustamos la URL al endpoint de login
  }

  // Guardar el token en el localStorage
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Obtener el token desde el localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Eliminar el token (por ejemplo, al cerrar sesión)
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('clienteId');
    localStorage.removeItem('productosSeleccionados');
    localStorage.removeItem('cantidadesSeleccionadas');
  }

  // Verificar si el usuario está autenticado (si hay un token)
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Guardar el clienteId en localStorage
  saveCliente(clienteId: string): void {
    localStorage.setItem('clienteId', clienteId);
  }

  // Obtener el clienteId desde el localStorage
  getClienteId(): string | null {
    return localStorage.getItem('clienteId');
  }

  // Método para obtener los datos del cliente con el clienteId
  obtenerCliente(): Observable<any> {
    const clienteId = this.getClienteId();  // Obtener el clienteId desde el localStorage
    if (!clienteId) {
      throw new Error('Cliente no encontrado en localStorage');  // Verifica que clienteId esté en localStorage
    }

    const token = this.getToken();  // Recuperamos el token desde el localStorage
    const headers = { 'Authorization': `Bearer ${token}` };  // Agregar el token en el encabezado
    return this.http.get(`${this.apiUrl}/${clienteId}`, { headers });  // Usamos el clienteId para obtener los datos
  }
}

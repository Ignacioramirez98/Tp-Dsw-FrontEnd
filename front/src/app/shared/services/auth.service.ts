import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  message: string;
  token: string;
  clienteId: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/clientes`;  // URL base ajustada

  constructor(private http: HttpClient) { }

  // Método para hacer login
  login(usuario: string, contraseña: string): Observable<LoginResponse> {
    const body = { usuario, contraseña };
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body);  // Ajustamos la URL al endpoint de login
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
    localStorage.removeItem('rol');
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

  // Guardar el rol del usuario autenticado
  saveRol(rol: string): void {
    localStorage.setItem('rol', rol);
  }

  // Obtener el rol del usuario autenticado
  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  // Método para obtener los datos del cliente con el clienteId
  obtenerCliente(): Observable<any> {
    const clienteId = this.getClienteId();  // Obtener el clienteId desde el localStorage
    if (!clienteId) {
      throw new Error('Cliente no encontrado en localStorage');  // Verifica que clienteId esté en localStorage
    }

    return this.http.get(`${this.apiUrl}/${clienteId}`);  // El token se agrega desde el interceptor
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  message: string;
  token: string;
  data?: {
    usuarioId?: string;
    usuario?: string;
    rol?: string;
    activo?: boolean;
    clienteId?: string;
    vendedorId?: string;
    operarioId?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuariosApiUrl = `${environment.apiUrl}/usuarios`;
  private clientesApiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) { }

  // Método para hacer login
  login(usuario: string, contraseña: string): Observable<LoginResponse> {
    const body = { usuario, contraseña };
    return this.http.post<LoginResponse>(`${this.usuariosApiUrl}/login`, body);
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
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('clienteId');
    localStorage.removeItem('vendedorId');
    localStorage.removeItem('operarioId');
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

  saveVendedorId(vendedorId: string): void {
    localStorage.setItem('vendedorId', vendedorId);
  }

  getVendedorId(): string | null {
    return localStorage.getItem('vendedorId');
  }

  saveOperarioId(operarioId: string): void {
    localStorage.setItem('operarioId', operarioId);
  }

  getOperarioId(): string | null {
    return localStorage.getItem('operarioId');
  }

  saveUsuarioId(usuarioId: string): void {
    localStorage.setItem('usuarioId', usuarioId);
  }

  getUsuarioId(): string | null {
    return localStorage.getItem('usuarioId');
  }

  // Guardar el rol del usuario autenticado
  saveRol(rol: string): void {
    localStorage.setItem('rol', rol);
  }

  // Obtener el rol del usuario autenticado
  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  getDecodedTokenPayload(): Record<string, any> | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  // Método para obtener los datos del cliente con el clienteId
  obtenerCliente(): Observable<any> {
    const clienteId = this.getClienteId();  // Obtener el clienteId desde el localStorage
    if (!clienteId) {
      throw new Error('Cliente no encontrado en localStorage');  // Verifica que clienteId esté en localStorage
    }

    return this.http.get(`${this.clientesApiUrl}/${clienteId}`);  // El token se agrega desde el interceptor
  }
}

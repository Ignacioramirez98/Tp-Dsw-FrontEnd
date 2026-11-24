import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatosUsuario, Usuario } from '../../shared/models/usuario.model';
import { environment } from '../../../environments/environment';

/** Gestión de cuentas de acceso (solo admin). */
@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<{ data: Usuario[] }> {
    return this.http.get<{ data: Usuario[] }>(this.apiUrl);
  }

  getUsuario(id: string): Observable<{ data: Usuario }> {
    return this.http.get<{ data: Usuario }>(`${this.apiUrl}/${id}`);
  }

  crear(datos: DatosUsuario): Observable<{ data: { usuarioId: string; usuario: string; rol: string } }> {
    return this.http.post<{ data: { usuarioId: string; usuario: string; rol: string } }>(this.apiUrl, datos);
  }

  /** Edita solo los campos que se envían (contraseña, nombre, estado, rol y perfil). */
  actualizar(id: string, datos: DatosUsuario): Observable<{ data: Usuario }> {
    return this.http.patch<{ data: Usuario }>(`${this.apiUrl}/${id}`, datos);
  }

  activar(id: string): Observable<{ data: Usuario }> {
    return this.http.patch<{ data: Usuario }>(`${this.apiUrl}/${id}/activar`, {});
  }

  desactivar(id: string): Observable<unknown> {
    return this.http.patch<unknown>(`${this.apiUrl}/${id}/desactivar`, {});
  }

  eliminar(id: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.apiUrl}/${id}`);
  }
}

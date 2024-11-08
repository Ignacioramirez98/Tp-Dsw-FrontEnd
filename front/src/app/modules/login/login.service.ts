import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'http://localhost:3000/login'; // Asegúrate de que la URL sea correcta

  constructor(private http: HttpClient) {}

  login(email: string, password: string, userType: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { email, password, userType });
  }

  // Método para guardar el token en el almacenamiento local del navegador
  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Método para obtener el token guardado en el almacenamiento local
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken(); // Si hay un token, está autenticado
  }
}

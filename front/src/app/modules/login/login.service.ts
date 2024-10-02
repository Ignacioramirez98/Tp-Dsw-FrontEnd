import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}
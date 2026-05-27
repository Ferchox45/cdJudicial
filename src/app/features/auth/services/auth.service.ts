import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = '';

  // Signal para exponer el token actual de forma reactiva a la app
  public token = signal<string | null>(localStorage.getItem('access_token'));

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.API_URL, credentials).pipe(
      tap(response => {
        // Si la respuesta es exitosa y contiene el token, lo guardamos
        if (response.data && response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
          this.token.set(response.data.access_token);

          if (response.data.refresh_token) {
            localStorage.setItem('refresh_token', response.data.refresh_token);
          }
        }
      })
    );
  }
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.token.set(null);
  }
}

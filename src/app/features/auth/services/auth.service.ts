import { Injectable, signal, inject, DestroyRef } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Router } from '@angular/router';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, tap, of, finalize } from 'rxjs';
import { LoginResponse } from '../models/auth.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  API = environment.apiUrl;
  private router = inject(Router);
  private http: HttpClient;

  private accessToken = signal<string | null>(null);
  readonly accessToken$ = toObservable(this.accessToken);
  readonly isAuthenticated = signal(false);
  readonly initialized = signal(false);

  private destroyRef = inject(DestroyRef);

  constructor(httpBackend: HttpBackend) {
    this.http = new HttpClient(httpBackend);
    this.tryRestoreSession();
  }

  private tryRestoreSession() {
    this.http.post<LoginResponse>(`${this.API}/api/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.initialized.set(true))
      )
      .subscribe({
        next: (res) => {
          if (res?.data?.access_token) {
            this.accessToken.set(res.data.access_token);
            this.isAuthenticated.set(true);
          }
        },
        error: () => {
          this.isAuthenticated.set(false);
        }
      });
  }

  login(usuario: string, contrasenia: string) {
    return this.http.post<LoginResponse | null>(`${this.API}/api/auth/login`, { usuario, contrasenia }, { withCredentials: true })
      .pipe(
        switchMap((res) => {
          if (res?.data?.access_token) {
            this.accessToken.set(res.data.access_token);
            this.isAuthenticated.set(true);
            return of(true);
          }
          return this.refresh();
        }),
      );
  }

  refresh() {
    return this.http.post<LoginResponse>(`${this.API}/api/auth/refresh`, {}, { withCredentials: true })
      .pipe(tap((res) => {
        if (res?.data?.access_token) {
          this.accessToken.set(res.data.access_token);
          this.isAuthenticated.set(true);
        }
      }));
  }

  logout() {
    return this.http.post(`${this.API}/api/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.accessToken.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/login']);
      }),
    );
  }

  getToken(): string | null {
    return this.accessToken();
  }
}

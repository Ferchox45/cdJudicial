import { Injectable, signal, inject, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, switchMap, tap, of, finalize, map, catchError } from 'rxjs';
import { LoginResponse, ProfileResponse, AuthenticatorStatus } from '../models/auth.model';
import { environment } from '../../../../environments/environment';
import { SessionStateService } from '../../permisos/services/session-state.service';
@Injectable({ providedIn: 'root' })
export class AuthService {
  API = environment.apiUrl;
  private router = inject(Router);
  private http = inject(HttpClient);
  private sessionState = inject(SessionStateService);

  private accessToken = signal<string | null>(null);
  readonly accessToken$ = toObservable(this.accessToken);
  readonly isAuthenticated = signal(false);
  readonly initialized = signal(false);

  readonly userNombre = signal<string | null>(null);
  readonly userFoto = signal<string | null>(null);

  private destroyRef = inject(DestroyRef);

  constructor() {
    setTimeout(() => this.tryRestoreSession());
  }

  private tryRestoreSession() {
    if (this.accessToken()) {
      this.initialized.set(true);
      return;
    }
    this.http.post<LoginResponse>(`${this.API}/api/auth/refresh`, {})
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.initialized.set(true))
      )
      .subscribe({
        next: (res) => {
          if (res?.data?.access_token) {
            this.accessToken.set(res.data.access_token);
            this.isAuthenticated.set(true);
            this.getProfile().subscribe();
          }
        },
        error: () => {
          this.isAuthenticated.set(false);
        }
      });
  }

  login(usuario: string, contrasenia: string) {
    return this.http.post<LoginResponse | null>(`${this.API}/api/auth/login`, { usuario, contrasenia })
      .pipe(
        switchMap((res) => {
          if (res?.data?.access_token) {
            this.accessToken.set(res.data.access_token);
            return this.getProfile().pipe(map(() => true));
          }
          return this.refresh().pipe(map(() => true));
        }),
      );
  }

  checkAuthenticatorStatus() {
    return this.http.get<{ status: string; data: AuthenticatorStatus }>(
      `${this.API}/api/auth/authenticator/status`
    );
  }

  verifyAuthenticatorCode(codigo: string) {
    return this.http.post<{ status: string; message: string; data: any }>(
      `${this.API}/api/auth/authenticator/verify`,
      { codigo }
    );
  }

  finalizarAutenticacion(): void {
    this.isAuthenticated.set(true);
  }

  refresh() {
    return this.http.post<LoginResponse>(`${this.API}/api/auth/refresh`, {})
      .pipe(tap((res) => {
        if (res?.data?.access_token) {
          this.accessToken.set(res.data.access_token);
          this.isAuthenticated.set(true);
        }
      }));
  }

  logout() {
    return this.http.post(`${this.API}/api/auth/logout`, {}).pipe(
      tap(() => {
        this.accessToken.set(null);
        this.isAuthenticated.set(false);
        this.userNombre.set(null);
        this.userFoto.set(null);
        this.sessionState.reiniciar();
        this.router.navigate(['/login']);
      }),
    );
  }

  getToken(): string | null {
    return this.accessToken();
  }

  private getProfile(): Observable<void> {
    return this.http.get<ProfileResponse>(`${this.API}/api/auth/profile`)
      .pipe(
        tap((res) => {
          this.userNombre.set(res.data.nombre);
          this.userFoto.set(res.data.foto ? `data:image/png;base64,${res.data.foto}` : null);
        }),
        map(() => undefined),
        catchError(() => of(undefined)),
      );
  }
}

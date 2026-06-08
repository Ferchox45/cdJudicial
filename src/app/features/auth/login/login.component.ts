import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import QRCode from 'qrcode';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { AuthService } from '../services/auth.service';

type LoginStep = 'login' | 'setup2fa' | 'verify2fa';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, SpinnerComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  usuario = '';
  contrasenia = '';
  error = signal<string | null>(null);
  isLoading = signal(false);
  showPassword = signal(false);

  loginStep = signal<LoginStep>('login');
  qrDataUrl = signal('');
  codigo = '';
  authenticatorError = signal<string | null>(null);
  loading2fa = signal(false);

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  login() {
    if (!this.usuario || !this.contrasenia) {
      this.error.set('Todos los campos son obligatorios');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.auth.login(this.usuario, this.contrasenia).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.auth.checkAuthenticatorStatus().subscribe({
          next: (res) => {
            if (res.data.activo) {
              this.loginStep.set('verify2fa');
            } else if (res.data.encodedSecret) {
              this.generarQR(res.data.encodedSecret, res.data.user);
              this.loginStep.set('setup2fa');
            } else {
              this.auth.finalizarAutenticacion();
              this.router.navigate(['/inicio']);
            }
          },
          error: () => {
            this.auth.finalizarAutenticacion();
            this.router.navigate(['/inicio']);
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.error.set('Usuario o contraseña incorrectos');
        } else {
          const body = err.error;
          const msg = body?.message || body?.error || body?.mensaje || '';
          this.error.set(msg || 'Error al iniciar sesión');
        }
      }
    });
  }

  private async generarQR(secret: string, user: string): Promise<void> {
    const otpauthUrl = `otpauth://totp/OficialiaPenal:${user}?secret=${secret}&issuer=OficialiaPenal`;
    try {
      const url = await QRCode.toDataURL(otpauthUrl);
      this.qrDataUrl.set(url);
    } catch {
      this.authenticatorError.set('Error al generar el código QR.');
    }
  }

  verificarCodigo(): void {
    if (!this.codigo || this.codigo.length !== 6) {
      this.authenticatorError.set('Ingrese un código de 6 dígitos.');
      return;
    }

    this.loading2fa.set(true);
    this.authenticatorError.set(null);

    this.auth.verifyAuthenticatorCode(this.codigo).subscribe({
          next: () => {
        this.loading2fa.set(false);
        this.auth.finalizarAutenticacion();
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        this.loading2fa.set(false);
        if (err.status === 400) {
          this.authenticatorError.set('Código inválido, intenta de nuevo.');
        } else if (err.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.authenticatorError.set('Error de conexión con el servidor.');
        }
      }
    });
  }

  cerrarModal2fa(): void {
    this.loginStep.set('login');
    this.codigo = '';
    this.authenticatorError.set(null);
  }
}

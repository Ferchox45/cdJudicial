import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { AuthService } from '../services/auth.service';

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
        this.router.navigate(['/inicio']);
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
}

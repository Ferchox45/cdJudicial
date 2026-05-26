import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // Inyección de dependencias (AuthService eliminado)
  private fb = inject(FormBuilder);
  private router = inject(Router);

  public loginForm: FormGroup;

  // Signals de estado
  public isLoading = signal<boolean>(false);
  public showPassword = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  constructor() {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required],
      recordarme: [false]
    });
  }

  togglePassword() {
    this.showPassword.update(value => !value);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { usuario, contrasena } = this.loginForm.value;

    // Simulamos un retraso de red de 1.5 segundos para que se vea el spinner
    setTimeout(() => {
      this.isLoading.set(false);

      // Validación estática (Puedes cambiar estas credenciales por las que prefieras)
      if (usuario === 'admin' && contrasena === 'admin') {
        this.router.navigate(['/inicio']);
      } else {
        this.errorMessage.set('Usuario o contraseña incorrectos.');
      }
    }, 1500);
  }
}

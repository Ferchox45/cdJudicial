import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // Inyección de dependencias moderna de Angular 21 (sin constructor)
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  public loginForm: FormGroup;

  // Signals de estado
  public isLoading = signal<boolean>(false);
  public showPassword = signal<boolean>(false);
  public errorMessage = signal<string | null>(null); // Para manejar errores de la API

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
  this.errorMessage.set(null); // Limpiamos errores previos

  const payload = {
    usuario: this.loginForm.value.usuario,
    contrasenia: this.loginForm.value.contrasena,
    idSistema: 1 // Asegúrate de que sea el ID correcto de tu sistema
  };

  this.authService.login(payload).subscribe({
    next: (response) => {
      this.isLoading.set(false);

      // Evaluamos la bandera success que manda tu API
      if (response.success) {
        this.router.navigate(['/inicio']);
      } else {
        this.errorMessage.set(response.message || 'Usuario o contraseña incorrectos.');
      }
    },
    error: (err) => {
      this.isLoading.set(false);
      if (err.error && err.error.message) {
        this.errorMessage.set(err.error.message);
      } else {
        this.errorMessage.set('Error de conexión con el servidor. Intente más tarde.');
      }
    }
  });
}
}

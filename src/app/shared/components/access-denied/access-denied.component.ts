import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        <div class="mx-auto flex h-16 w-16 items-center justify-center bg-red-50 text-red-600 rounded-full mb-5">
          <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
        <p class="text-sm text-gray-500 mb-8">
          No tienes permisos suficientes para acceder a esta sección.
        </p>
        <a routerLink="/inicio"
           class="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white bg-orange-400 hover:bg-orange-500 transition-all duration-200">
          Volver al inicio
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessDeniedComponent {}

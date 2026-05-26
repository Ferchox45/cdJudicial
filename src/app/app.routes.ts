import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './features/dashboard/components/dashboardmain/dashboard.component';

export const routes: Routes = [
  // 1. REDIRECCIÓN INICIAL (Para pruebas locales)
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  // 2. RUTA DEL LOGIN
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // 3. RUTAS PRIVADAS (Dashboard y sub-módulos)
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./features/dashboard/components/home/home.component').then(m => m.HomeComponent),
        data: { breadcrumb: 'Inicio' }
      },

      // --- MÓDULO APELACIONES (Jerarquizado con hijos) ---
      {
        path: 'capturaApelacion',
        data: { breadcrumb: 'Captura de Apelación' },
        loadChildren: () => import('./features/apelaciones/captura-apelaciones/captura-apelaciones.routes').then(m => m.CAPTURA_APELACIONES_ROUTES)
      },
      // --- MÓDULO BUSCADORES (Compartido en un solo chunk) ---
      {
        path: '',
        loadChildren: () => import('./features/buscadores/buscadores.routes').then(m => m.BUSCADORES_ROUTES)
      },

      // --- MÓDULO ESTADÍSTICAS (Modularizado) ---
      {
        path: '',
        loadChildren: () => import('./features/estadisticas/estadisticas-plana/estadisticas.routes').then(m => m.ESTADISTICAS_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'inicio',
    pathMatch: 'full'
  }
];

import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './features/dashboard/components/dashboardmain/dashboard.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // 1. REDIRECCIÓN INICIAL
  {
    path: '',
    redirectTo: 'login',
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
    canActivate: [authGuard],
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./features/dashboard/components/home/home.component').then(m => m.HomeComponent),
        data: { breadcrumb: 'Inicio' }
      },

      // --- MÓDULO APELACIONES ---
      {
        path: 'capturaApelacion',
        data: { breadcrumb: 'Captura de Apelación' },
        loadChildren: () => import('./features/apelaciones/captura-apelaciones/captura-apelaciones.routes').then(m => m.CAPTURA_APELACIONES_ROUTES)
      },

      // --- MÓDULO BUSCADORES ---
      {
        path: '',
        loadChildren: () => import('./features/buscadores/buscadores.routes').then(m => m.BUSCADORES_ROUTES)
      },

      // --- MÓDULO ESTADÍSTICAS ---
      {
        path: '',
        loadChildren: () => import('./features/estadisticas/estadisticas-plana/estadisticas.routes').then(m => m.ESTADISTICAS_ROUTES)
      }
    ]
  },

  // 4. WILDCARD (Ruta no encontrada)
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

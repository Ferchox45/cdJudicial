import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './features/dashboard/components/dashboardmain/dashboard.component';
import { anexosGuard } from './features/apelaciones/anexos/guards/anexos.guard';
export const routes: Routes = [
  // 1. PRIMERA REGLA: Si la URL está completamente vacía, redirige al login obligatoriamente
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full' // Importante para que coincida exactamente con la raíz vacía
  },

  // 2. RUTA DEL LOGIN
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // 3. RUTAS PRIVADAS (Solo se accede si escribes la URL o tras el inicio de sesión exitoso)
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./features/dashboard/components/home/home.component').then(m => m.HomeComponent),
        data: { breadcrumb: 'Inicio' }
      },

      // Grupo Apelaciones (Jerarquizado)
      {
        path: 'capturaApelacion',
        data: { breadcrumb: 'Captura de Apelación' },
        children: [
          {
            path: '', // Esta es la ruta base: /capturaApelacion
            loadComponent: () => import('./features/apelaciones/captura-apelaciones/captura-apelacones.component').then(m => m.CapturaApelacionesComponent)
          },
          {
            path: 'anexos', // Esta es la ruta hija: /capturaApelacion/anexos
            loadComponent: () => import('./features/apelaciones/anexos/anexos.component').then(m => m.AnexosComponent),
            data: { breadcrumb: 'Anexos' },
            canActivate: [anexosGuard]
          }
        ]
      },
      {
        path: 'busquedaApelacion',
        loadComponent: () => import('./features/apelaciones/busqueda-apelaciones/busquedaApelaciones.component').then(m => m.BusquedaApelacionesComponent),
        data: { breadcrumb: 'Búsqueda de Apelación' }
      },

      // Grupo Buscadores
      {
        path: 'buscadorHistorico',
        loadComponent: () => import('./features/buscadores/buscador-historico/buscadorHistorico.component').then(m => m.BuscadorHistoricoComponent),
        data: { breadcrumb: 'Buscador Histórico' }
      },
      {
        path: 'buscadorPlano',
        loadComponent: () => import('./features/buscadores/buscador-plano/buscadorPlano.component').then(m => m.BuscadorPlanoComponent),
        data: { breadcrumb: 'Buscador Plano' }
      },

      // Grupo Estadísticas
      {
        path: 'estadisticasPlana',
        loadComponent: () => import('./features/estadisticas/estadisticas-plana/estadisticasPlana.component').then(m => m.EstadisticasPlanaComponent),
        data: { breadcrumb: 'Estadísticas' }
      }
    ]
  },

  // 4. COMODÍN: Cualquier otra ruta rota manda al login
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

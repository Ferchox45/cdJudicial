import { Routes } from '@angular/router';

export const ESTADISTICAS_ROUTES: Routes = [
  {
    path: 'estadisticasPlana',
    loadComponent: () => import('../estadisticas-plana/estadisticasPlana.component').then(m => m.EstadisticasPlanaComponent),
    data: { breadcrumb: 'Estadísticas' }
  }
];

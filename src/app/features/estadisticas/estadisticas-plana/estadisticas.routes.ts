import { Routes } from '@angular/router';
import { seccionesGuard } from '../../permisos/guards/secciones.guard';

export const ESTADISTICAS_ROUTES: Routes = [
  {
    path: 'estadisticas',
    loadComponent: () => import('../estadisticas-plana/estadisticasPlana.component').then(m => m.EstadisticasPlanaComponent),
    data: { breadcrumb: 'Estadísticas' },
    canActivate: [seccionesGuard]
  }
];

import { Routes } from '@angular/router';
import { seccionesGuard } from '../permisos/guards/secciones.guard';

export const SEGUIMIENTO_ROUTES: Routes = [
  {
    path: 'recibirtoca',
    loadComponent: () => import('./recibir/recibir.component').then((m) => m.RecibirComponent),
    data: { breadcrumb: 'Recibir Toca' },
    canActivate: [seccionesGuard],
  },
  {
    path: 'turnarToca',
    loadComponent: () => import('./turnar/turnar.component').then((m) => m.TurnarComponent),
    data: { breadcrumb: 'Turnar Toca' },
    canActivate: [seccionesGuard],
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./historial/historial.component').then((m) => m.HistorialComponent),
    data: { breadcrumb: 'Historial' },
    canActivate: [seccionesGuard],
  },
  { path: '**', redirectTo: 'recibir' },
];

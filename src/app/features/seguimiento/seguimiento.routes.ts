import { Routes } from '@angular/router';

export const SEGUIMIENTO_ROUTES: Routes = [
  {
    path: 'recibirtoca',
    loadComponent: () => import('./recibir/recibir.component').then(m => m.RecibirComponent),
    data: { breadcrumb: 'Recibir Toca' },
  },
  {
    path: 'turnarToca',
    loadComponent: () => import('./turnar/turnar.component').then(m => m.TurnarComponent),
    data: { breadcrumb: 'Turnar Toca' },
  },
  {
    path: 'historial',
    loadComponent: () => import('./historial/historial.component').then(m => m.HistorialComponent),
    data: { breadcrumb: 'Historial' },
  },
  { path: '**', redirectTo: 'recibir' },
];

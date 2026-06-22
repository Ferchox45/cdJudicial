import { Routes } from '@angular/router';

export const SEGUIMIENTO_ROUTES: Routes = [
  {
    path: 'recibir',
    loadComponent: () => import('./recibir/recibir.component').then(m => m.RecibirComponent),
    data: { breadcrumb: 'Recibir Toca' },
  },
  {
    path: 'turnar',
    loadComponent: () => import('./turnar/turnar.component').then(m => m.TurnarComponent),
    data: { breadcrumb: 'Turnar Toca' },
  },
  {
    path: 'historial',
    loadComponent: () => import('./kardex/kardex.component').then(m => m.KardexComponent),
    data: { breadcrumb: 'Kardex' },
  },
  { path: '**', redirectTo: 'recibir' },
];

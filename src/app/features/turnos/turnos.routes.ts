import { Routes } from '@angular/router';

export const TURNOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./turnos.component').then(m => m.TurnosComponent),
    data: { breadcrumb: 'Turnar a Sala' },
  },
];

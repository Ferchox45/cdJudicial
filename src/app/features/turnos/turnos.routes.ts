import { Routes } from '@angular/router';
import { seccionesGuard } from '../permisos/guards/secciones.guard';

export const TURNOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./turnos.component').then((m) => m.TurnosComponent),
    data: { breadcrumb: 'Turnar a Sala' },
    canActivate: [seccionesGuard],
  },
];

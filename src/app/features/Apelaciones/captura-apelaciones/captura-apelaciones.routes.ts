import { Routes } from '@angular/router';
import { anexosGuard } from '../anexos/guards/anexos.guard';
import { unsavedChangesGuard } from '../../../shared/guards/unsaved-changes.guard';
import { seccionesGuard } from '../../../features/permisos/guards/secciones.guard';

export const CAPTURA_APELACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./captura-apelaciones.component').then((m) => m.CapturaApelacionesComponent),
    canDeactivate: [unsavedChangesGuard],
    canActivate: [seccionesGuard],
  },
  {
    path: 'anexos',
    loadComponent: () => import('../anexos/anexos.component').then((m) => m.AnexosComponent),
    data: { breadcrumb: 'Anexos' },
    canDeactivate: [unsavedChangesGuard],
    canActivate: [anexosGuard, seccionesGuard],
  },
  {
    path: 'busquedaApelacion',
    loadComponent: () =>
      import('../busqueda-apelaciones/busquedaApelaciones.component').then(
        (m) => m.BusquedaApelacionesComponent,
      ),
    data: { breadcrumb: 'Búsqueda de Apelación' },
    canActivate: [seccionesGuard],
  },
];

import { Routes } from '@angular/router';
import { anexosGuard } from '../anexos/guards/anexos.guard'; // Ajusta la ruta si es necesario

export const CAPTURA_APELACIONES_ROUTES: Routes = [
  {
    path: '', // Ruta base: se carga cuando entras a /capturaApelacion
    loadComponent: () => import('./captura-apelacones.component').then(m => m.CapturaApelacionesComponent)
  },
  {
    path: 'anexos', // Ruta hija: se carga cuando entras a /capturaApelacion/anexos
    loadComponent: () => import('../anexos/anexos.component').then(m => m.AnexosComponent),
    data: { breadcrumb: 'Anexos' },
    canActivate: [anexosGuard]
  },
  {
    path: 'busquedaApelacion',
    loadComponent: () => import('../busqueda-apelaciones/busquedaApelaciones.component').then(m => m.BusquedaApelacionesComponent),
    data: { breadcrumb: 'Búsqueda de Apelación' }
  },
];

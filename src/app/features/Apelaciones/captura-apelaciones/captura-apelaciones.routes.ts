import { Routes } from '@angular/router';
import { anexosGuard } from '../anexos/guards/anexos.guard'; // Ajusta la ruta si es necesario

export const CAPTURA_APELACIONES_ROUTES: Routes = [
  {
    path: '', // Ruta base
    loadComponent: () => import('./captura-apelacones.component').then(m => m.CapturaApelacionesComponent)
  },
  {
  // Ruta hija
    path: 'anexos',
    loadComponent: () => import('../anexos/anexos.component').then(m => m.AnexosComponent),
    data: { breadcrumb: 'Anexos' },
    canActivate: [anexosGuard]
  },
  {
    //Ruta hija
    path: 'busquedaApelacion',
    loadComponent: () => import('../busqueda-apelaciones/busquedaApelaciones.component').then(m => m.BusquedaApelacionesComponent),
    data: { breadcrumb: 'Búsqueda de Apelación' }
  },
];

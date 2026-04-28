import { Routes } from '@angular/router';

export const routes: Routes = [
{
    path: '',
    redirectTo: 'captura-apelaciones',
    pathMatch: 'full'
},

{
  path: 'capturaApelacion',
  loadComponent: () => import('./features/Apelaciones/captura-apelaciones/captura-apelacones.component')
  .then(m => m.CapturaApelacionesComponent)
},

{
  path: 'busquedaApelacion',
  loadComponent: () => import('./features/Apelaciones/busqueda-apelaciones/busquedaApelaciones.component')
  .then(m => m.SearchComponent)
},

{
  path: 'anexos',
  loadComponent: () => import('./features/Apelaciones/anexos/anexos.component')
  .then(m => m.AnexosComponent)
}

];

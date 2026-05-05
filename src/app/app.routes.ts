import { Routes } from '@angular/router';

export const routes: Routes = [
{
    path: '',
    redirectTo: 'captura-apelaciones',
    pathMatch: 'full'
},

{
  path: 'capturaApelacion',
  loadComponent: () => import('./features/apelaciones/captura-apelaciones/captura-apelacones.component')
  .then(m => m.CapturaApelacionesComponent)
},

{
  path: 'busquedaApelacion',
  loadComponent: () => import('./features/apelaciones/busqueda-apelaciones/busquedaApelaciones.component')
  .then(m => m.BusquedaApelacionesComponent)
},

{
  path: 'anexos',
  loadComponent: () => import('./features/apelaciones/anexos/anexos.component')
  .then(m => m.AnexosComponent)
},

{
  path: 'buscadorHistorico',
  loadComponent: () => import('./features/buscadores/buscador-historico/buscadorHistorico.component')
  .then(m => m.BuscadorHistoricoComponent)
},

{
  path: 'buscadorPlano',
  loadComponent: () => import('./features/buscadores/buscador-plano/buscadorPlano.component')
  .then(m => m.BuscadorPlanoComponent)
}

];

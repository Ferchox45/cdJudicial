import { Routes } from '@angular/router';

export const BUSCADORES_ROUTES: Routes = [
  {
    path: 'buscadorHistorico',
    loadComponent: () => import('./buscador-historico/buscadorHistorico.component').then(m => m.BuscadorHistoricoComponent),
    data: { breadcrumb: 'Buscador Histórico' }
  },
  {
    path: 'buscadorPlano',
    loadComponent: () => import('./buscador-plano/buscadorPlano.component').then(m => m.BuscadorPlanoComponent),
    data: { breadcrumb: 'Buscador Plano' }
  }
];

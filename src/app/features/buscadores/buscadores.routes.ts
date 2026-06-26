import { Routes } from '@angular/router';
import { seccionesGuard } from '../permisos/guards/secciones.guard';

export const BUSCADORES_ROUTES: Routes = [
  {
    path: 'buscadorHistorico',
    loadComponent: () => import('./buscador-historico/buscadorHistorico.component').then(m => m.BuscadorHistoricoComponent),
    data: { breadcrumb: 'Buscador Histórico' },
    canActivate: [seccionesGuard]
  },
  {
    path: 'buscadorPlano',
    loadComponent: () => import('./buscador-plano/buscadorPlano.component').then(m => m.BuscadorPlanoComponent),
    data: { breadcrumb: 'Buscador Plano' },
    canActivate: [seccionesGuard]
  }
];

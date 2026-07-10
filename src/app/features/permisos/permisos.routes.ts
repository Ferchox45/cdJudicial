import { Routes } from '@angular/router';

export const PERMISOS_ROUTES: Routes = [
  {
    path: 'seleccion-permisos',
    loadComponent: () =>
      import('./components/seleccion-permisos/seleccion-permisos.component').then(
        (m) => m.SeleccionPermisosComponent,
      ),
  },
];

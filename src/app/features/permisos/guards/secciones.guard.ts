import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SessionStateService } from '../services/session-state.service';
import { PermisosService } from '../data/permisos.service';

export const seccionesGuard: CanActivateChildFn = (childRoute) => {
  const session = inject(SessionStateService);
  const permisosService = inject(PermisosService);
  const router = inject(Router);

  const path = childRoute.routeConfig?.path;
  if (!path) return of(true);

  const ruta = path.startsWith('/') ? path : '/' + path;
  const idPantalla = session.buscarPantallaPorDescripcion(ruta);
  if (idPantalla === null) return of(true);

  const idAreaSistemaUsuario = session.idAreaSistemaUsuario();
  const idPerfil = session.idPerfil();
  if (!idAreaSistemaUsuario || !idPerfil) return of(true);

  return permisosService.getSecciones({ idAreaSistemaUsuario, idPantalla, idPerfil }).pipe(
    tap(secciones => session.setSecciones(secciones)),
    map(() => true),
    catchError(() => of(true)),
  );
};

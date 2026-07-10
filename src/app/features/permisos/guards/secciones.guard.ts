import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SessionStateService } from '../services/session-state.service';
import { PermisosService } from '../data/permisos.service';

export const seccionesGuard: CanActivateFn = (route) => {
  const session = inject(SessionStateService);
  const permisosService = inject(PermisosService);
  const router = inject(Router);

  const fullPath = route.pathFromRoot
    .map((r) => r.routeConfig?.path ?? '')
    .filter((p) => p.length > 0)
    .join('/');
  const ruta = '/' + fullPath;

  if (ruta === '/inicio') return true;

  const idPantalla = session.buscarPantallaPorDescripcion(ruta);
  if (idPantalla === null) return router.parseUrl('/acceso-denegado');

  if (['/turnos', '/turnarToca', '/recibirtoca'].includes(ruta)) {
    session.setPantalla(idPantalla);
  }

  const idAreaSistemaUsuario = session.idAreaSistemaUsuario();
  const idPerfil = session.idPerfil();
  if (!idAreaSistemaUsuario || !idPerfil) return router.parseUrl('/acceso-denegado');

  return permisosService.getSecciones({ idAreaSistemaUsuario, idPantalla, idPerfil }).pipe(
    tap((secciones) => session.setSecciones(secciones)),
    map(() => true),
    catchError(() => of(true)),
  );
};

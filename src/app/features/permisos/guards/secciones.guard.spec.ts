import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SessionStateService } from '../services/session-state.service';
import { PermisosService } from '../data/permisos.service';
import { seccionesGuard } from './secciones.guard';
import { Seccion } from '../models/permisos.types';

function buildRoute(paths: string[]): ActivatedRouteSnapshot {
  const route = { routeConfig: { path: paths[paths.length - 1] }, pathFromRoot: [] as any[] } as any;
  route.pathFromRoot = paths.map(p => ({ routeConfig: { path: p } } as any));
  return route;
}

describe('seccionesGuard', () => {
  const setup = (secciones: Seccion[], path: string, idPantalla: number | null) => {
    const sessionSpy = {
      buscarPantallaPorDescripcion: vi.fn().mockReturnValue(idPantalla),
      idAreaSistemaUsuario: signal(1).asReadonly(),
      idPerfil: signal(1).asReadonly(),
      setSecciones: vi.fn(),
    };

    const permisosSpy = {
      getSecciones: vi.fn().mockReturnValue(of(secciones)),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: SessionStateService, useValue: sessionSpy },
        { provide: PermisosService, useValue: permisosSpy },
      ],
    });
  };

  it('should allow /inicio without checking permissions', () => {
    setup([], '/inicio', null);
    const route = buildRoute(['', '', 'inicio']);
    const result = TestBed.runInInjectionContext(() => seccionesGuard(route, null as any));
    expect(result).toBe(true);
  });

  it('should allow when pantalla exists in backend', async () => {
    setup([{ idSeccion: 1, descripcion: 'leer', activo: true }], '/buscadorPlano', 14332);
    const route = buildRoute(['', '', '', 'buscadorPlano']);
    const result = TestBed.runInInjectionContext(() => seccionesGuard(route, null as any)) as any;
    const val = await firstValueFrom(result);
    expect(val).toBe(true);
  });

  it('should block when pantalla not found in backend', () => {
    setup([], '/historial', null);
    const route = buildRoute(['', '', '', 'historial']);
    const result = TestBed.runInInjectionContext(() => seccionesGuard(route, null as any)) as any;
    expect(result.toString()).toContain('/acceso-denegado');
  });
});

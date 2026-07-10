import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStateService } from '../services/session-state.service';
import { permisosGuard } from './permisos.guard';

describe('permisosGuard', () => {
  const setup = (permisosCompletados: boolean) => {
    const sessionSpy = {
      permisosCompletados: signal(permisosCompletados).asReadonly(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: SessionStateService, useValue: sessionSpy }],
    });
  };

  it('should allow navigation when permissions are completed', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => permisosGuard());
    expect(result).toBe(true);
  });

  it('should redirect to /seleccion-permisos when permissions not completed', () => {
    setup(false);
    const result = TestBed.runInInjectionContext(() => permisosGuard()) as any;
    expect(result.toString()).toContain('/seleccion-permisos');
  });
});

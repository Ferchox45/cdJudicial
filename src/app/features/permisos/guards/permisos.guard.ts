import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStateService } from '../services/session-state.service';

export const permisosGuard = () => {
  const session = inject(SessionStateService);
  const router = inject(Router);
  if (session.permisosCompletados()) return true;
  return router.parseUrl('/seleccion-permisos');
};

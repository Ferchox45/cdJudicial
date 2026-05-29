import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApelacionContextService} from '../data/apelacion-context.service';

export const anexosGuard: CanActivateFn = (route, state) => {
  const contextService = inject(ApelacionContextService);
  const router = inject(Router);

  // Verifica si ya tiene guardado un ID de apelacion en el Signal
  if (contextService.apelacionId() !== null) {
    return true; // Puede pasar a la pantalla de anexos
  } else {
    // Si no hay ID se regresa a la pantalla principal
    return router.parseUrl('/capturaApelacion');
  }
};


import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApelacionContextService} from '../../../core/services/apelacion-context.service';

export const anexosGuard: CanActivateFn = (route, state) => {
  const contextService = inject(ApelacionContextService);
  const router = inject(Router);

  // Verificamos si ya tenemos un ID de apelación guardado en tu Signal
  if (contextService.apelacionId() !== null) {
    return true; // Puede pasar a la pantalla de anexos
  } else {
    // No hay ID, lo regresamos al formulario principal
    return router.parseUrl('/capturaApelacion');
  }
};


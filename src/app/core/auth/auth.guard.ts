import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../features/auth/services/auth.service';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  console.log('1. Guard ejecutado. Estado initialized:', auth.initialized()); // <-- AÑADE ESTO

  // Convertimos el signal a un observable para poder "esperar"
  return toObservable(auth.initialized).pipe(
    filter((isInit) => isInit === true), // Detiene la ejecución hasta que sea true
    map(() => {
      console.log('2. Guard evaluando autenticación:', auth.isAuthenticated()); // <-- AÑADE ESTO
      if (auth.isAuthenticated()) return true;
      return router.parseUrl('/login');
    })
  );
};

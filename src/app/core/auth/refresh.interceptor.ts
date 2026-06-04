import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && err.status === 401
          && !req.url.includes('/auth/refresh')
          && !req.url.includes('/auth/login')) {

        return auth.refresh().pipe(
          switchMap(() => {
            const newReq = req.clone({
              setHeaders: { Authorization: `Bearer ${auth.getToken()}` },
            });
            return next(newReq);
          }),
          catchError((refreshErr) => {
      auth.logout().subscribe();
      return throwError(() => refreshErr);
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, Subject, filter, take } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

let isRefreshing = false;
let refreshSubject: Subject<boolean>;

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && err.status === 401
          && !req.url.includes('/auth/refresh')
          && !req.url.includes('/auth/login')
          && !req.url.includes('/auth/logout')) {

        if (!isRefreshing) {
          isRefreshing = true;
          refreshSubject = new Subject<boolean>();

          auth.refresh().subscribe({
            next: () => {
              isRefreshing = false;
              refreshSubject.next(true);
              refreshSubject.complete();
            },
            error: () => {
              isRefreshing = false;
              refreshSubject.next(false);
              refreshSubject.complete();
              auth.logout().subscribe();
            },
          });
        }

        return refreshSubject.pipe(
          filter(result => result),
          take(1),
          switchMap(() => {
            const newReq = req.clone({
              setHeaders: { Authorization: `Bearer ${auth.getToken()}` },
            });
            return next(newReq);
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};

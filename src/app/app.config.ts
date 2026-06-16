import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { routes } from './app.routes';
import { credentialsInterceptor } from './core/auth/credentials.interceptor';
import { authInterceptor } from './core/auth/auth.interceptor';
import { refreshInterceptor } from './core/auth/refresh.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([credentialsInterceptor, authInterceptor, refreshInterceptor]),
    ),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    { provide: APP_BASE_HREF, useValue: environment.baseUrl },
  ]
};

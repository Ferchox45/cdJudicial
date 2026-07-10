import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const setup = (initialized: boolean, isAuthenticated: boolean) => {
    const authSpy = {
      initialized: signal(initialized).asReadonly(),
      isAuthenticated: signal(isAuthenticated).asReadonly(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
  };

  it('should allow navigation when authenticated', async () => {
    setup(true, true);
    const result = TestBed.runInInjectionContext(() => authGuard()) as any;
    const val = await firstValueFrom(result);
    expect(val).toBe(true);
  });

  it('should redirect to /login when not authenticated', async () => {
    setup(true, false);
    const result = TestBed.runInInjectionContext(() => authGuard()) as any;
    const val = await firstValueFrom(result);
    expect(val.toString()).toContain('/login');
  });
});

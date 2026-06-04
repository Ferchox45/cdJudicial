import { Injectable } from '@angular/core';
import { Observable, of, tap, shareReplay, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CacheService {
  private memCache = new Map<string, { obs: Observable<any>; ts: number }>();
  private readonly CACHE_TTL = 1000 * 60 * 30;

  manejarCache<T>(key: string, httpCall$: Observable<T>): Observable<T> {
    // Memoria
    const existing = this.memCache.get(key);
    if (existing && Date.now() - existing.ts < this.CACHE_TTL) {
      return existing.obs;
    }
    if (existing) this.memCache.delete(key);

    // Storage (Persistencia al recargar)
    const cachedData = this.getFromStorage<T>(key);
    if (cachedData) {
      const obs$ = of(cachedData).pipe(shareReplay(1));
      this.memCache.set(key, { obs: obs$, ts: Date.now() });
      return obs$;
    }

    // HTTP
    const request$ = httpCall$.pipe(
      tap(data => this.saveToStorage(key, data)),
      shareReplay(1),
      catchError(err => {
        this.memCache.delete(key);
        throw err;
      })
    );

    this.memCache.set(key, { obs: request$, ts: Date.now() });
    return request$;
  }

  delete(key: string): void {
    this.memCache.delete(key);
    sessionStorage.removeItem(key);
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    } catch { console.warn('Storage lleno o deshabilitado'); }
  }

  private getFromStorage<T>(key: string): T | null {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > this.CACHE_TTL) {
        this.delete(key);
        return null;
      }
      return data;
    } catch { return null; }
  }
}

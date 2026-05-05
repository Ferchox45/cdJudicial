import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, timeout, catchError, tap, shareReplay, map } from 'rxjs';

import {
  ApelacionBusqueda,
  CapturaApelacionCatalogos,
  CapturaAnexoCatalogos,
  CatalogoBusqueda
} from '../models';


const BASE_URL = 'https://judicial-lpkf.onrender.com/api';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutos

// Centralizamos las llaves de caché para evitar errores tipográficos
export const CACHE_KEYS = {
  CAPTURA: 'catalogos_captura',
  ANEXO: 'catalogos_anexo',
  BUSQUEDA: 'catalogos_busqueda'
};

@Injectable({ providedIn: 'root' })
export class ApelacionService {
  private http = inject(HttpClient);


  // ── 1. Gestor de Caché Centralizado ─────────────────────────
  // En lugar de múltiples variables nulas, usamos un Map para manejar N cachés
  private memCache = new Map<string, Observable<any>>();

  // ══════════════════════════════════════════════════════════
  // OBTENCIÓN DE CATÁLOGOS (Usando helper de caché)
  // ══════════════════════════════════════════════════════════

getCatalogoCaptura(materia: string): Observable<CapturaApelacionCatalogos> {
  const httpCall$ = this.http
    .get<{ data: CapturaApelacionCatalogos }>(`${BASE_URL}/apelaciones/form-data`, {
      params: { materia }
    })
    .pipe(map(res => res.data));

  // Si usas caché por materia, necesitas una key dinámica:
  return this.manejarCache(`${CACHE_KEYS.CAPTURA}_${materia}`, httpCall$);
}

  getCatalogoAnexo(): Observable<CapturaAnexoCatalogos> {
    const httpCall$ = this.http.get<{ data: { anexos: any[] } }>(`${BASE_URL}/apelaciones/anexos/form-data`)
      .pipe(map(res => ({ anexo: res?.data?.anexos ?? [] })));

    return this.manejarCache(CACHE_KEYS.ANEXO, httpCall$);
  }

  getCatalogoBusqueda(): Observable<CatalogoBusqueda> {
    const httpCall$ = this.http.get<{ data: CatalogoBusqueda }>(`${BASE_URL}/search/filters`)
      .pipe(map(res => res.data));

    return this.manejarCache(CACHE_KEYS.BUSQUEDA, httpCall$);
  }

  // ══════════════════════════════════════════════════════════
  // INVALIDACIÓN DE CATÁLOGOS
  // ══════════════════════════════════════════════════════════

  invalidarCatalogos(): void        { this.invalidarCache(CACHE_KEYS.CAPTURA); }
  invalidarAnexos(): void           { this.invalidarCache(CACHE_KEYS.ANEXO); }
  invalidarCatalogoBusqueda(): void { this.invalidarCache(CACHE_KEYS.BUSQUEDA); }

  // ══════════════════════════════════════════════════════════
  // OPERACIONES CRUD Y BÚSQUEDAS
  // ══════════════════════════════════════════════════════════

  buscarPorFolio(folio: string): Observable<ApelacionBusqueda> {
    const param = encodeURIComponent(folio.trim());
    return this.http.get<{ data: ApelacionBusqueda }>(`${BASE_URL}/apelaciones/detail?folioOficialia=${param}`)
      .pipe(
        timeout(15000),
        map(res => res.data)
      );
  }



  guardarApelacion(payload: any): Observable<any> {
    return this.http.post(`${BASE_URL}/apelaciones`, payload)
      .pipe(timeout(15000));
  }

  guardarAnexos(payload: any): Observable<any> {
    return this.http.post(`${BASE_URL}/apelaciones/anexos`, payload)
      .pipe(timeout(15000));
  }

  // ══════════════════════════════════════════════════════════
  // HELPERS PRIVADOS DE CACHÉ
  // ══════════════════════════════════════════════════════════

  /**
   * Helper centralizado que maneja la memoria, el sessionStorage y la petición HTTP
   */
  private manejarCache<T>(key: string, httpCall$: Observable<T>): Observable<T> {
    // 1. Revisar caché en memoria
    if (this.memCache.has(key)) {
      return this.memCache.get(key)!;
    }

    // 2. Revisar caché en sessionStorage
    const cachedData = this.getFromStorage<T>(key);
    if (cachedData) {
      const obs$ = of(cachedData);
      this.memCache.set(key, obs$); // Subir a memoria para acceso rápido
      return obs$;
    }

    // 3. Hacer la petición si no hay caché
    const request$ = httpCall$.pipe(
      timeout(60000),
      tap(data => this.saveToStorage(key, data)),
      shareReplay(1),
      catchError(err => {
        this.memCache.delete(key); // Limpiar memoria si falla
        throw err;
      })
    );

    this.memCache.set(key, request$);
    return request$;
  }

  private invalidarCache(key: string): void {
    this.memCache.delete(key);
    sessionStorage.removeItem(key);
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch { console.warn('Error guardando en sessionStorage'); }
  }

  private getFromStorage<T>(key: string): T | null {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;

      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp > CACHE_TTL) {
        sessionStorage.removeItem(key);
        return null;
      }
      return data as T;
    } catch {
      return null;
    }
  }

  getFolioTentativo(): Observable<string> {
    return this.http.get<{ data: { folioTentativo: string } }>(`${BASE_URL}/apelaciones/form-data
      `)
      .pipe(map(res => res?.data?.folioTentativo ?? ''));
  }

}


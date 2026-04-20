import { Resultado } from './../models/busqueda-profunda';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, timeout, catchError, tap, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApelacionBusqueda, CapturaApelacionCatalogos, CapturaAnexoCatalogos, NoseencontroBusqueda, CatalogoBusqueda} from '../models';
const BASE_URL  = 'https://judicial-lpkf.onrender.com/api';
const CACHE_KEY = 'catalogos_captura';
const CACHE_KEY_ANEXO = 'catalogos_anexo';   // ← caché independiente
const CACHE_TTL = 1000 * 60 * 30;
const CACHE_KEY_BUSQUEDA = 'catalogos_busqueda';



@Injectable({ providedIn: 'root' })
export class ApelacionService {
  private http = inject(HttpClient);

  // ── Caché en memoria ───────────────────────────────────────
  private cache$:         Observable<CapturaApelacionCatalogos> | null = null;
  private cacheAnexo$:    Observable<CapturaAnexoCatalogos>    | null = null;
  private cacheBusqueda$: Observable<CatalogoBusqueda>         | null = null;

  // ══════════════════════════════════════════════════════════
  // CARGA DE CATÁLOGOS EN EL FORM DE CAPTURA DE APELACIONES
  // ══════════════════════════════════════════════════════════
  getCatalogoCaptura(): Observable<CapturaApelacionCatalogos> {
  if (this.cache$) return this.cache$;

  const cached = this.getFromStorage<CapturaApelacionCatalogos>(CACHE_KEY);
  if (cached) {
    console.log('Catálogos cargados desde caché');
    this.cache$ = of(cached);
    return this.cache$;
  }

  console.log('Cargando catálogos desde la API...');
  this.cache$ = this.http
    .get<{ data: CapturaApelacionCatalogos }>(`${BASE_URL}/apelaciones/form-data`)
    .pipe(
      timeout(60000),   // ← 60s para que Render despierte
      map(res => ({
        materias:         res.data.materias,
        apelaciones:      res.data.apelaciones,
        tiposApelaciones: res.data.tiposApelaciones,
        tiposEscritos:    res.data.tiposEscritos,
        juzgados:         res.data.juzgados,
        municipios:       res.data.municipios,
        localidades:      res.data.localidades,
        delitos:          res.data.delitos,
      })),
      tap(data => {
        console.log('Catálogos recibidos:', data);
        this.saveToStorage(CACHE_KEY, data);
      }),
      shareReplay(1),
      catchError(err => {
        console.error('❌ Error cargando catálogos:', err);
        this.cache$ = null;
        throw err;
      })
    );

  return this.cache$;
}

  invalidarCatalogos(): void {
    this.cache$ = null;
    sessionStorage.removeItem(CACHE_KEY);
  }

  // ══════════════════════════════════════════════════════════
  // CARGAR LISTAS DE ANEXOS
  // ══════════════════════════════════════════════════════════
getCatalogoAnexo(): Observable<CapturaAnexoCatalogos> {
  // ...caché igual...

this.cacheAnexo$ = this.http
  .get<any>(`${BASE_URL}/apelaciones/anexos/form-data`)
  .pipe(
    timeout(60000),
    tap(res => console.log('📥 Respuesta CRUDA anexos:', JSON.stringify(res, null, 2))),
    map(res => {
      const anexo = res?.data?.anexos ?? [];
      console.log('📦 Anexos mapeados:', anexo);
      return { anexo };
    }),
    tap(data => this.saveToStorage(CACHE_KEY_ANEXO, data)),
    shareReplay(1),
    catchError(err => { this.cacheAnexo$ = null; throw err; })
  );

  return this.cacheAnexo$;
}

  invalidarAnexos(): void {
    this.cacheAnexo$ = null;
    sessionStorage.removeItem(CACHE_KEY_ANEXO);
  }

  // ══════════════════════════════════════════════════════════
  // BÚSQUEDA RAPIDA
  // ══════════════════════════════════════════════════════════
buscarPorFolio(folio: string): Observable<ApelacionBusqueda> {
    const param = encodeURIComponent(folio.trim());
    return this.http
      .get<{ data: ApelacionBusqueda }>(`${BASE_URL}/apelaciones/detail?folioOficialia=${param}`)
      .pipe(
        timeout(15000),
        map(res => res.data),           // ← extrae .data
        catchError(err => { throw err; })
      );
  }

  folionoEncontrado(folio: string): Observable<NoseencontroBusqueda> {
    const param = encodeURIComponent(folio.trim());
    return this.http
      .get<NoseencontroBusqueda>(`${BASE_URL}/apelaciones/detail?folioOficialia=${param}`)
      .pipe(
        timeout(15000),
        catchError(err => { throw err; })
      );
  }

  // ══════════════════════════════════════════════════════════
  // STORAGE (genérico — reutilizable para cualquier caché)
  // ══════════════════════════════════════════════════════════
  private saveToStorage<T>(key: string, data: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch { }
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
    } catch { return null; }
  }

  guardarApelacion(payload: any) {
    return this.http.post(`${BASE_URL}/apelaciones`, payload).pipe(
      timeout(15000),
      catchError(err => { throw err; })
    );
  }

buscarApelaciones(params: any): Observable<Resultado[]> {
  let httpParams = new HttpParams();

  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      httpParams = httpParams.set(key, params[key]);
    }
  });

  return this.http
    .get<any>(`${BASE_URL}/search`, { params: httpParams })  // ← /search
    .pipe(
      tap(res  => console.log('📥 Respuesta cruda búsqueda:', res)),
      map(res  => res?.data ?? []),
      catchError(err => {
        console.error('❌ Error búsqueda - Status:', err.status);
        console.error('Mensaje:', err.error);
        console.error('URL:', err.url);
        throw err;
      })
    );
}

getCatalogoBusqueda(): Observable<CatalogoBusqueda> {
  if (this.cacheBusqueda$) return this.cacheBusqueda$;

  const cached = this.getFromStorage<CatalogoBusqueda>(CACHE_KEY_BUSQUEDA);
  if (cached) {
    console.log('📦 Catálogo buscador desde caché');
    this.cacheBusqueda$ = of(cached);
    return this.cacheBusqueda$;
  }

  this.cacheBusqueda$ = this.http
    .get<any>(`${BASE_URL}/search/filters`)
    .pipe(
      timeout(60000),
      map(res => ({                           // ← extrae res.data
        salas:            res.data.salas,
        nomenclaturas:    res.data.nomenclaturas,
        tiposApelaciones: res.data.tiposApelaciones,
      })),
      tap(data => {
        console.log('✅ Catálogo buscador mapeado:', data);
        this.saveToStorage(CACHE_KEY_BUSQUEDA, data);
      }),
      shareReplay(1),
      catchError(err => {
        console.error('❌ Error catálogo buscador:', err);
        this.cacheBusqueda$ = null;
        throw err;
      })
    );

  return this.cacheBusqueda$;
}

  invalidarCatalogoBusqueda(): void {
    this.cacheBusqueda$ = null;
    sessionStorage.removeItem(CACHE_KEY_BUSQUEDA);
  }

guardarAnexos(payload: any): Observable<any> {
  return this.http.post(`${BASE_URL}/apelaciones/anexos`, payload).pipe(
    timeout(15000),
    tap(res => console.log('Anexos guardados:', res)),
    catchError(err => {
      console.error('❌ Error guardando anexos - Status:', err.status);
      console.error('Mensaje:', err.error);
      throw err;
    })
  );
}

}

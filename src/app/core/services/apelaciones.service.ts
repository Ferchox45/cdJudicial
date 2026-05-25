import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, map } from 'rxjs';
import { CacheService } from './cache.service';
import {
  BusquedaRapida,
  CapturaApelacionCatalogos,
  CapturaAnexoCatalogos,
  CatalogoBusqueda
} from '../models';
import { environment } from '../../../environments/environment.development';
export const CACHE_KEYS = {
  CAPTURA: 'catalogos_captura',
  ANEXO: 'catalogos_anexo',
  BUSQUEDA: 'catalogos_busqueda'
};

@Injectable({ providedIn: 'root' })
export class ApelacionService {
  private http = inject(HttpClient);
  private cache = inject(CacheService);
   apiEndpoint = environment.apiUrl;

  // ── Catálogos con Caché ──────────────────────────────────────

  getCatalogoCaptura(materia: string): Observable<CapturaApelacionCatalogos> {
    const call$ = this.http
      .get<{ data: CapturaApelacionCatalogos }>(`${this.apiEndpoint}/api/apelaciones/catalogos`, { params: { materia } })
      .pipe(map(res => res.data));

    return this.cache.manejarCache(`${CACHE_KEYS.CAPTURA}_${materia}`, call$);
  }

  getCatalogoAnexo(): Observable<CapturaAnexoCatalogos> {
    const call$ = this.http.get<{ data: { anexos: any[] } }>(`${this.apiEndpoint}/api/apelaciones/anexos/catalogos`)
      .pipe(map(res => ({ anexo: res?.data?.anexos ?? [] })));

    return this.cache.manejarCache(CACHE_KEYS.ANEXO, call$);
  }
  // ── Métodos sin Caché (Datos dinámicos/Acciones) ─────────────
  getLocalidades(idMunicipio: number): Observable<any[]> {
    return this.http
      .get<{ data: { localidades: any[] } }>(`${this.apiEndpoint}/api/apelaciones/${idMunicipio}/localidades`)
      .pipe(timeout(15000), map(res => res.data.localidades));
  }

  buscarPorFolio(folio: string): Observable<BusquedaRapida> {
    const param = encodeURIComponent(folio.trim());
    return this.http.get<{ data: BusquedaRapida }>(`${this.apiEndpoint}/api/apelaciones/detalle?folioOficialia=${param}`)
      .pipe(timeout(15000), map(res => res.data));
  }

  guardarApelacion(payload: any): Observable<any> {
    return this.http.post(`${this.apiEndpoint}/api/apelaciones`, payload).pipe(timeout(15000));
  }

  guardarAnexos(payload: any): Observable<any> {
    return this.http.post(`${this.apiEndpoint}/api/apelaciones/anexos`, payload).pipe(timeout(15000));
  }

  // ── Invalidación manual ──────────────────────────────────────

  invalidarCatalogos(): void {
    // Borramos ambos para asegurar que el folio se actualice globalmente
    this.cache.delete(`${CACHE_KEYS.CAPTURA}_penal`);
    this.cache.delete(`${CACHE_KEYS.CAPTURA}_indigena`);
  }

  invalidarAnexos(): void { this.cache.delete(CACHE_KEYS.ANEXO); }
  invalidarBusqueda(): void { this.cache.delete(CACHE_KEYS.BUSQUEDA); }
}

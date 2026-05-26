// apelacion-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, map } from 'rxjs';
import { CacheService } from '../../../../core/services/cache.service';
import { CapturaApelacionCatalogos } from '../models/catalogo-apelaciones.model';
import { BusquedaRapida } from '../models/busqueda-rap.model';
import { environment } from '../../../../../environments/environment.development';

export const CACHE_KEYS_APELACION = {
  CAPTURA: 'catalogos_captura',
  BUSQUEDA: 'catalogos_busqueda',
};

@Injectable({ providedIn: 'root' })
export class ApelacionApiService {
  private http = inject(HttpClient);
  private cache = inject(CacheService);
  private apiEndpoint = environment.apiUrl;

  // ── Catálogos con Caché ──────────────────────────────────────

  getCatalogoCaptura(materia: string): Observable<CapturaApelacionCatalogos> {
    const call$ = this.http
      .get<{ data: CapturaApelacionCatalogos }>(
        `${this.apiEndpoint}/api/apelaciones/catalogos`,
        { params: { materia } }
      )
      .pipe(map((res) => res.data));

    return this.cache.manejarCache(
      `${CACHE_KEYS_APELACION.CAPTURA}_${materia}`,
      call$
    );
  }

  // ── Métodos sin Caché ────────────────────────────────────────

  getLocalidades(idMunicipio: number): Observable<any[]> {
    return this.http
      .get<{ data: { localidades: any[] } }>(
        `${this.apiEndpoint}/api/apelaciones/${idMunicipio}/localidades`
      )
      .pipe(timeout(15000), map((res) => res.data.localidades));
  }

  getTiposApelacion(idApelacion: number): Observable<any[]> {
    return this.http
      .get<{ data: { tiposApelacion: any[] } }>(
        `${this.apiEndpoint}/api/apelaciones/${idApelacion}/tipos-apelacion`
      )
      .pipe(timeout(15000), map((res) => res.data.tiposApelacion));
  }

  buscarPorFolio(folio: string): Observable<BusquedaRapida> {
    const param = encodeURIComponent(folio.trim());
    return this.http
      .get<{ data: BusquedaRapida }>(
        `${this.apiEndpoint}/api/apelaciones/detalle?folioOficialia=${param}`
      )
      .pipe(timeout(15000), map((res) => res.data));
  }

  guardarApelacion(payload: any): Observable<any> {
    return this.http
      .post(`${this.apiEndpoint}/api/apelaciones`, payload)
      .pipe(timeout(15000));
  }

  // ── Invalidación de Caché ────────────────────────────────────

  invalidarCatalogos(): void {
    this.cache.delete(`${CACHE_KEYS_APELACION.CAPTURA}_penal`);
    this.cache.delete(`${CACHE_KEYS_APELACION.CAPTURA}_indigena`);
  }

  invalidarBusqueda(): void {
    this.cache.delete(CACHE_KEYS_APELACION.BUSQUEDA);
  }
}
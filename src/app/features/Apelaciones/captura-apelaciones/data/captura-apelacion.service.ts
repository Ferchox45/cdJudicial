// apelacion-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, map } from 'rxjs';
import { CacheService } from '../../../../core/services/cache.service';
import { CapturaApelacionCatalogos } from '../models/catalogo-apelaciones.model';
import { BusquedaRapida } from '../models/busqueda-rap.model';
import { ApelacionPayload, ApelacionSaveResponse } from '../models/apelacion-aux.model';
import { environment } from '../../../../../environments/environment';

export const CACHE_KEYS_APELACION = {
  CAPTURA: 'catalogos_captura',
  BUSQUEDA: 'catalogos_busqueda',
};

@Injectable({ providedIn: 'root' })
export class ApelacionApiService {
  private http = inject(HttpClient);
  private cache = inject(CacheService);
  private apiEndpoint = environment.apiUrl;

  // Catálogos con Caché

  getCatalogoCaptura(idMateria: number): Observable<CapturaApelacionCatalogos> {
    const call$ = this.http
      .get<{ data: CapturaApelacionCatalogos }>(
        `${this.apiEndpoint}/api/apelaciones/catalogos`,
        { params: { idMateria } }
      )
      .pipe(map((res) => res.data));

    return this.cache.manejarCache(
      `${CACHE_KEYS_APELACION.CAPTURA}_${idMateria}`,
      call$
    );
  }

  // Métodos sin Caché

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

  certificarApelacion(id: number): Observable<{ certificacion: string }> {
    return this.http
      .get<{ data: { certificacion: string } }>(
        `${this.apiEndpoint}/api/apelaciones/${id}/certificacion`
      )
      .pipe(timeout(15000), map((res) => res.data));
  }

  guardarApelacion(payload: ApelacionPayload): Observable<ApelacionSaveResponse> {
    return this.http
      .post<ApelacionSaveResponse>(`${this.apiEndpoint}/api/apelaciones`, payload)
      .pipe(timeout(15000));
  }

  // Invalidación de Caché

  invalidarCatalogos(): void {
    this.cache.delete(`${CACHE_KEYS_APELACION.CAPTURA}_5`);
    this.cache.delete(`${CACHE_KEYS_APELACION.CAPTURA}_6`);
  }

  invalidarBusqueda(): void {
    this.cache.delete(CACHE_KEYS_APELACION.BUSQUEDA);
  }
}

// anexo-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, map } from 'rxjs';
import { CacheService } from '../../../../core/services/cache.service';
import { CapturaAnexoCatalogos, AnexoPayload, AnexoSaveResponse } from '../models/anexo.model';
import { environment } from '../../../../../environments/environment';

export const CACHE_KEYS_ANEXO = {
  ANEXO: 'catalogos_anexo',
};

@Injectable({ providedIn: 'root' })
export class AnexoApiService {
  private http = inject(HttpClient);
  private cache = inject(CacheService);
  private apiEndpoint = environment.apiUrl;

  // ── Catálogos con Caché ──────────────────────────────────────

  getCatalogoAnexo(): Observable<CapturaAnexoCatalogos> {
    const call$ = this.http
      .get<{ data: { anexos: any[] } }>(
        `${this.apiEndpoint}/api/apelaciones/anexos/catalogos`
      )
      .pipe(map((res) => ({ anexo: res?.data?.anexos ?? [] })));

    return this.cache.manejarCache(CACHE_KEYS_ANEXO.ANEXO, call$);
  }

  // ── Manda la peticion al servidor para guardar los anexos

  guardarAnexos(payload: AnexoPayload): Observable<AnexoSaveResponse> {
    return this.http
      .post<AnexoSaveResponse>(`${this.apiEndpoint}/api/apelaciones/anexos`, payload)
      .pipe(timeout(15000));
  }

  // ── Invalidación de Caché ────────────────────────────────────

  invalidarAnexos(): void {
    this.cache.delete(CACHE_KEYS_ANEXO.ANEXO);
  }
}

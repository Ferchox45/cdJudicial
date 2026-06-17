import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, timeout } from 'rxjs';
import { CacheService } from '../../../core/services/cache.service';
import { environment } from '../../../../environments/environment';
import {
  ApiResponseTurnos,
  CatalogoTurnos,
  PagedResultTurnos,
  TurnoFiltrosDTO,
  TurnosExportarImportarResponse,
} from '../models/turnos.model';

export const CACHE_KEY_TURNOS_CATALOGOS = 'turnos_catalogos';

@Injectable({ providedIn: 'root' })
export class TurnosService {
  private http = inject(HttpClient);
  private cache = inject(CacheService);
  private apiEndpoint = environment.apiUrl;

  getCatalogos(): Observable<CatalogoTurnos> {
    const call$ = this.http
      .get<{ status: string; message: string; data: CatalogoTurnos }>(`${this.apiEndpoint}/api/turnos/catalogos`)
      .pipe(map((res) => res.data));

    return this.cache.manejarCache(CACHE_KEY_TURNOS_CATALOGOS, call$);
  }

  listar(filtros: TurnoFiltrosDTO, page: number, limit: number): Observable<PagedResultTurnos> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (filtros.idSala != null) params = params.set('idSala', filtros.idSala);
    if (filtros.folioOficialia) params = params.set('folioOficialia', filtros.folioOficialia);
    if (filtros.folioApelacion) params = params.set('folioApelacion', filtros.folioApelacion);
    if (filtros.soloTurnadas) params = params.set('soloTurnadas', 'true');

    return this.http.get<ApiResponseTurnos>(`${this.apiEndpoint}/api/turnos`, { params })
      .pipe(
        timeout(15000),
        map((res) => ({
          resultados: res.data.tocas ?? [],
          paginacion: { total: res.data.total, page: res.data.page, limit: res.data.limit },
        }))
      );
  }

  exportar(ids: number[]): Observable<TurnosExportarImportarResponse> {
    return this.http.post<TurnosExportarImportarResponse>(
      `${this.apiEndpoint}/api/turnos/exportar`,
      { ids },
    );
  }

  importar(ids: number[]): Observable<TurnosExportarImportarResponse> {
    return this.http.post<TurnosExportarImportarResponse>(
      `${this.apiEndpoint}/api/turnos/importar`,
      { ids },
    );
  }
}

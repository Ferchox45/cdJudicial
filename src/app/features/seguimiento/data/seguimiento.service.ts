import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponseEnvelope,
  ApiPagedData,
  OpcionesTurnar,
  HistorialResponse,
  MovimientoPendiente,
  PagedResult,
  BatchResponse,
  ApelacionTurnable,
  CatalogoItem,
} from '../models/seguimiento.model';

@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  private http = inject(HttpClient);
  private apiEndpoint = environment.apiUrl;

  getOpcionesTurnar(idPerfil: number): Observable<OpcionesTurnar> {
    return this.http
      .get<ApiResponseEnvelope<OpcionesTurnar>>(
        `${this.apiEndpoint}/api/movimientos/turnar/opciones`,
        { params: { idPerfil } },
      )
      .pipe(map(res => res.data));
  }

  getApelacionesTurnar(
    params: { idSala: number; idPerfil: number; pagina: number; limite: number },
  ): Observable<PagedResult<ApelacionTurnable>> {
    let httpParams = new HttpParams()
      .set('idSala', params.idSala)
      .set('idPerfil', params.idPerfil)
      .set('page', params.pagina)
      .set('limit', params.limite);

    return this.http
      .get<ApiResponseEnvelope<ApiPagedData<ApelacionTurnable>>>(
        `${this.apiEndpoint}/api/movimientos/turnar`,
        { params: httpParams },
      )
      .pipe(
        timeout(15000),
        map(res => ({
          resultados: res.data.data,
          paginacion: { total: res.data.total, page: res.data.page, limit: res.data.limit },
        })),
      );
  }

  turnar(payload: {
    ids: number[];
    idPerfilOrigen: number;
    idPerfilDestino: number;
    idGeneralDestino: number | null;
  }): Observable<BatchResponse> {
    return this.http
      .post<ApiResponseEnvelope<BatchResponse>>(
        `${this.apiEndpoint}/api/movimientos/turnar`,
        payload,
      )
      .pipe(map(res => res.data));
  }

  getPendientesRecibir(
    params: { idSala: number; idPerfil: number; pagina: number; limite: number },
  ): Observable<PagedResult<MovimientoPendiente>> {
    let httpParams = new HttpParams()
      .set('idSala', params.idSala)
      .set('idPerfil', params.idPerfil)
      .set('page', params.pagina)
      .set('limit', params.limite);

    return this.http
      .get<ApiResponseEnvelope<ApiPagedData<MovimientoPendiente>>>(
        `${this.apiEndpoint}/api/movimientos/recibir`,
        { params: httpParams },
      )
      .pipe(
        timeout(15000),
        map(res => ({
          resultados: res.data.data,
          paginacion: { total: res.data.total, page: res.data.page, limit: res.data.limit },
        })),
      );
  }

  recibir(ids: number[]): Observable<BatchResponse> {
    return this.http
      .post<ApiResponseEnvelope<BatchResponse>>(
        `${this.apiEndpoint}/api/movimientos/recibir`,
        { ids },
      )
      .pipe(map(res => res.data));
  }

  getCatalogosHistorial(): Observable<{ nomenclaturas: CatalogoItem[] }> {
    return this.http
      .get<ApiResponseEnvelope<{ nomenclaturas: CatalogoItem[] }>>(
        `${this.apiEndpoint}/api/estados/catalogos`,
      )
      .pipe(map(res => ({ nomenclaturas: res.data.nomenclaturas })));
  }

  getHistorial(params: { idSala: number; folioApelacion?: string; idNomenclatura?: number }): Observable<HistorialResponse> {
    let httpParams = new HttpParams().set('idSala', params.idSala);
    if (params.folioApelacion?.trim()) httpParams = httpParams.set('folioApelacion', params.folioApelacion.trim());
    if (params.idNomenclatura != null) httpParams = httpParams.set('idNomenclatura', params.idNomenclatura);
    return this.http
      .get<ApiResponseEnvelope<HistorialResponse>>(
        `${this.apiEndpoint}/api/movimientos/historial`,
        { params: httpParams },
      )
      .pipe(
        timeout(15000),
        map(res => res.data),
      );
  }
}

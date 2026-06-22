import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponseEnvelope,
  ApiPagedData,
  OpcionesTurnar,
  KardexResponse,
  MovimientoPendiente,
  PagedResult,
  BatchResponse,
  ApelacionTurnable,
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

  getHistorial(folioOficialia: string): Observable<KardexResponse> {
    return this.http
      .get<ApiResponseEnvelope<KardexResponse>>(
        `${this.apiEndpoint}/api/movimientos/historial`,
        { params: { folioOficialia } },
      )
      .pipe(
        timeout(15000),
        map(res => res.data),
      );
  }
}

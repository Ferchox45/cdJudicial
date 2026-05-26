import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponseBusqProf, Resultado } from './../models/busqueda-profunda';
import { CacheService } from './cache.service';
import { environment } from '../../../environments/environment.development';
import { PagedResultProf, CatalogoBusqueda } from '../models/busqueda-profunda';
import { CACHE_KEYS_APELACION } from '../../features/apelaciones/captura-apelaciones/data/captura-apelacion.service';

@Injectable({ providedIn: 'root' })
export class BusquedaProfService {

  private http = inject(HttpClient);
  private cache = inject(CacheService);
  apiEndpoint = environment.apiUrl;
  /**
   * Genera y descarga un Excel basado en los filtros proporcionados.
   * @param filtros Objeto con los parámetros de búsqueda (ej. { folioOficialia: '0198/2026', otroFiltro: 'valor' })
   */
    getCatalogoBusqueda(): Observable<CatalogoBusqueda> {
      const call$ = this.http.get<{ data: CatalogoBusqueda }>(`${this.apiEndpoint}/api/busquedas/filtros`)
        .pipe(map(res => res.data));

      return this.cache.manejarCache(CACHE_KEYS_APELACION.BUSQUEDA, call$);
    }

  exportarExcel(filtros: any): Observable<Blob> {
    let params = new HttpParams();

    // Iteramos sobre el objeto de filtros para construirlos dinámicamente
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        const valor = filtros[key];
        // Solo agregamos el parámetro si tiene un valor válido (ignora null, undefined o strings vacíos)
        if (valor !== null && valor !== undefined && valor !== '') {
          params = params.append(key, valor);
        }
      });
    }

    return this.http.get(`${this.apiEndpoint}/api/busquedas/exportar-excel`, {
      params: params,
      responseType: 'blob' // ¡Crucial para poder descargar el archivo correctamente!
    });
  }

buscarApelaciones(
  params: any,
  page: number,
  limit: number
): Observable<PagedResultProf>{
  let httpParams = new HttpParams()
    .set('page', page)
    .set('limit', limit);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      httpParams = httpParams.set(key, String(value));
    }
  });

  return this.http.get<ApiResponseBusqProf>(`${this.apiEndpoint}/api/busquedas/`, { params: httpParams })
    .pipe(
      map(response => ({
        resultados: response.data.apelaciones ?? [],
        paginacion: {
          total: response.data.total,
          page:  response.data.page,
          limit: response.data.limit,
        }
      }))
    );
}

  exportarPdf(filtros: any): Observable<Blob> {
  let params = new HttpParams();

  if (filtros) {
    Object.keys(filtros).forEach(key => {
      const valor = filtros[key];
      if (valor !== null && valor !== undefined && valor !== '') {
        params = params.append(key, valor);
      }
    });
  }

  return this.http.get(`${this.apiEndpoint}/api/busquedas/exportar-pdf`, {
    params: params,
    responseType: 'blob'
  });
}

  }


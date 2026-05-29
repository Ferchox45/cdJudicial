import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import { ApiResponsePlana, PagedResultPlana} from '../models/buscador-plano.model';
import { environment } from '../../../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class BuscadorPlanoService {
  private http = inject(HttpClient);
  apiEndpoint = environment.apiUrl;

  buscarPlana (  params: any, page: number, limit: number): Observable<PagedResultPlana> {
    let httpParams = new HttpParams()
    .set('page', page)
    .set('limit', limit);

      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });

      return this.http.get<ApiResponsePlana>(`${this.apiEndpoint}/api/busquedas/plano/`, { params: httpParams })
        .pipe(
          map(response => ({
            resultados: response.data.planos ?? [],
            paginacion: {
              total: response.data.total,
              page:  response.data.page,
              limit: response.data.limit,
            }
          }))
        );
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
    return this.http.get(`${this.apiEndpoint}/api/busquedas/plano/exportar-excel`, {
      params: params,
      responseType: 'blob'
    });
  }

    exportarPdf(filtros: any): Observable<Blob> {
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

      return this.http.get(`${this.apiEndpoint}/api/busquedas/plano/exportar-pdf`, {
        params: params,
        responseType: 'blob'
      });
    }
}

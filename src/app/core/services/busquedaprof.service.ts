import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Resultado } from './../models/busqueda-profunda';
const BASE_URL = 'https://judicial-lpkf.onrender.com/api';

@Injectable({ providedIn: 'root' })
export class BusquedaProfService {

  private http = inject(HttpClient);

  /**
   * Genera y descarga un Excel basado en los filtros proporcionados.
   * @param filtros Objeto con los parámetros de búsqueda (ej. { folioOficialia: '0198/2026', otroFiltro: 'valor' })
   */
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

    return this.http.get(`${BASE_URL}/search/export`, {
      params: params,
      responseType: 'blob' // ¡Crucial para poder descargar el archivo correctamente!
    });
  }

    buscarApelaciones(params: any): Observable<Resultado[]> {
      // Limpieza elegante de parámetros nulos/vacíos
      let httpParams = new HttpParams();

      console.log(params)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });

      return this.http.get<{ data: Resultado[] }>(`${BASE_URL}/search`, { params: httpParams })
        .pipe(map(res => res?.data ?? []));
    }
}

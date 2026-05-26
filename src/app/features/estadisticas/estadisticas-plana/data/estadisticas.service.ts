import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import { ResultadoBusquedaPlanaEstadistica, ApiResponseEstadisticas,
  searchFormPlanaEstadistica, PagedResult, ReporteAgrupado,
  ApiResponseAgrupada} from '../models/estadisticas';
import { BusquedaEstadisticaMapper } from '../util/estadisticasPlana.mapper';
import { environment } from '../../../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class EstadisticaService {
private http = inject(HttpClient);
apiEndpoint = environment.apiUrl;

buscarEstadistica(
  form: searchFormPlanaEstadistica,
  page: number,
  limit: number
): Observable<PagedResult> {

  const dto = BusquedaEstadisticaMapper.toDTO(form);

  let params = new HttpParams()
    .set('page', page)
    .set('limit', limit);

  Object.entries(dto).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  });

  return this.http.get<ApiResponseEstadisticas>(`${this.apiEndpoint}/api/estadisticas/plano/`, { params }).pipe(
    map(response => ({
      resultados: response.data.planos.map(item => this.mapItem(item)),
      paginacion: {
        total: response.data.total,
        page:  response.data.page,
        limit: response.data.limit,
      }
    }))
  );
}

private mapItem(item: any): ResultadoBusquedaPlanaEstadistica {
  return {
    ...item,
    anioRecep:   item.añoRecep,
    anioIngreso: item.añoIngreso,
    añoRecep:    undefined,
    añoIngreso:  undefined,
  };
}

buscarAgrupada(
    form: searchFormPlanaEstadistica
  ): Observable<ResultadoBusquedaPlanaEstadistica[]> {

    const dto = BusquedaEstadisticaMapper.toDTO(form);

    let params = new HttpParams();
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<ApiResponseAgrupada>(`${this.apiEndpoint}/api/estadisticas/agrupado/`, { params }).pipe(
      map(response => this.aplanarAgrupado(response.data.agrupados))
    );
  }

  // Aplana el JSON anidado a una lista plana de ResultadoBusquedaPlanaEstadistica
  private aplanarAgrupado(agrupado: any[]): ResultadoBusquedaPlanaEstadistica[] {
    const filas: ResultadoBusquedaPlanaEstadistica[] = [];

    for (const itemSala of agrupado) {
      const sala = itemSala.sala;

      for (const anio of Object.keys(itemSala.anios)) {
        const meses = itemSala.anios[anio].meses;

        for (const mes of Object.keys(meses)) {
          const nomenclaturas = meses[mes].nomenclaturas;

          for (const nomenclatura of Object.keys(nomenclaturas)) {
            const apelaciones = nomenclaturas[nomenclatura].apelaciones;

            for (const apelacion of Object.keys(apelaciones)) {
              const tipos = apelaciones[apelacion].tipos;

              for (const tipoApelacion of Object.keys(tipos)) {
                filas.push({
                  idApelacion:             null,
                  sala,
                  tramite:                 null,
                  folioOficialia:          null,
                  nomenclatura,
                  folioToca:               null,
                  apelacion,
                  tipoApelacion,
                  tipoEscrito:             null,
                  fechaHoraRecepcion:      null,
                  fechaHoraIngresoJuzgado: null,
                  juzgadoOrigen:           null,
                  mesRecep:                mes,
                  anioRecep:               Number(anio),
                  mesIngreso:              null,
                  anioIngreso:             null,
                });
              }
            }
          }
        }
      }
    }

    return filas;
  }
exportarExcel(filtros: any, imagenBase64: string | null = null): Observable<Blob> {
  const body = {
    filtros,
    imagenBase64, // null si no hay gráfica activa, el back lo maneja
  };

  console.log('📡 [SERVICIO] exportarExcel POST:', {
    filtros,
    tieneImagen: !!imagenBase64,
    longitud: imagenBase64?.length ?? 0,
  });

  return this.http.post(`${this.apiEndpoint}/api/estadisticas/exportar`, body, {
    responseType: 'blob',
  });
}

  // Devuelve la jerarquía intacta para la tabla HTML
buscarAgrupadaJerarquica(form: searchFormPlanaEstadistica): Observable<ReporteAgrupado[]> {
  const dto = BusquedaEstadisticaMapper.toDTO(form);
  let params = new HttpParams();
  Object.entries(dto).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  });

  return this.http.get<ApiResponseAgrupada>(`${this.apiEndpoint}/api/estadisticas/agrupado/`, { params }).pipe(
    map(response => response.data.agrupados)
  );
}

}

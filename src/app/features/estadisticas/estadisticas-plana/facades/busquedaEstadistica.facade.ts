import { inject, Injectable, signal, computed, DestroyRef } from '@angular/core';
import { ModalService } from '../../../../shared/components/modal-custom/services/modal.service';
import {
  SearchFormPlanaEstadistica,
  PagedResult,
  ReporteAgrupado,
  ChartSlice,
} from '../models/estadisticas';
import { EstadisticaService } from '../data/estadisticas.service';
import { ResultadoBusquedaPlanaEstadistica } from '../models/estadisticas';
import { BusquedaEstadisticaMapper } from '../util/estadisticasPlana.mapper';
import { CampoAgrupacion, OPCIONES_AGRUPACION, GrupoAgrupado } from '../models/agrupacion';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

export const FORM_VACIO: SearchFormPlanaEstadistica = {
  idSala: '',
  idNomenclatura: '',
  idApelacion: '',
  fechaInicio: '',
  fechaFin: '',
};

@Injectable({ providedIn: 'root' })
export class BusquedaEstadisticaFacade {
  private readonly busquedaEstadistica = inject(EstadisticaService);
  private readonly modal = inject(ModalService);
  readonly chartActivo = signal<{ data: ChartSlice[]; title: string } | null>(null);
  private readonly _todosResultadosPlanos = signal<ResultadoBusquedaPlanaEstadistica[]>([]);
  private readonly destroyRef = inject(DestroyRef);
  readonly dataJerarquica = signal<ReporteAgrupado[]>([]);

  // ── Estado
  readonly buscando = signal(false);
  readonly exportando = signal(false);
  readonly form = signal<SearchFormPlanaEstadistica>({ ...FORM_VACIO });
  readonly porPagina = signal(10);
  readonly resultados = signal<ResultadoBusquedaPlanaEstadistica[]>([]);
  readonly paginaActual = computed(() => this._paginacion().page);
  readonly totalPaginas = computed(() =>
    Math.ceil(this._paginacion().total / this._paginacion().limit),
  );
  readonly totalResultados = computed(() => this._paginacion().total);
  private readonly _paginacion = signal({ total: 0, page: 1, limit: 10 });
  private _cache = new Map<number, ResultadoBusquedaPlanaEstadistica[]>();
  private readonly _paginaAgrupada = signal(1);
  readonly cargandoAgrupada = signal(false);

  private _toggleRecursivo(grupos: GrupoAgrupado[], id: string): GrupoAgrupado[] {
    return grupos.map((grupo) => {
      if (grupo.id === id) {
        return { ...grupo, expandido: !grupo.expandido };
      }
      return {
        ...grupo,
        hijos: grupo.hijos.map((hijo) =>
          'id' in hijo ? this._toggleRecursivo([hijo], id)[0] : hijo,
        ),
      };
    });
  }

  irPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;

    if (this._cache.has(pagina)) {
      this.resultados.set(this._cache.get(pagina)!);
      this._paginacion.update((p) => ({ ...p, page: pagina }));
      return;
    }

    this._ejecutarBusqueda(pagina, false);
  }

  cambiarPorPagina(limit: number): void {
    this.porPagina.set(limit);
    if (this.resultados().length === 0) return;
    this._limpiarCache();
    this._ejecutarBusqueda(1, false);
  }

  private busquedaAgrupada(): void {
    this.cargandoAgrupada.set(true);

    // Usamos el nuevo método
    this.busquedaEstadistica.buscarAgrupadaJerarquica(this.form()).subscribe({
      next: (datos) => {
        this.dataJerarquica.set(datos); // <-- Guardamos la data con subtotales
        this.cargandoAgrupada.set(false);
        this._paginaAgrupada.set(1);
      },
      error: () => {
        this.cargandoAgrupada.set(false);
        this.modal.error('Error', 'Ocurrió un error al cargar la estadística detallada.');
      },
    });
  }

  etiquetaCampo(campo: CampoAgrupacion): string {
    return OPCIONES_AGRUPACION.find((o) => o.campo === campo)?.etiqueta ?? campo;
  }
  // ── Acciones públicas
  buscarEstadistica(): void {
    if (!BusquedaEstadisticaMapper.tieneCriterios(this.form())) {
      this.modal.info('Criterios requeridos', 'Debes ingresar al menos un criterio de búsqueda.');
      return;
    }
    this._limpiarCache();
    this._ejecutarBusqueda(1, true);
    this.busquedaAgrupada();
  }
  // ── Privados
  private _limpiarCache(): void {
    this._cache.clear();
    this._paginacion.update((p) => ({ ...p, total: 0, page: 1 }));
  }

  private _ejecutarBusqueda(page: number, mostrarModal: boolean): void {
    this.buscando.set(true);
    this.busquedaEstadistica.buscarEstadistica(this.form(), page, this.porPagina()).subscribe({
      next: (res) => this._onSuccess(res, mostrarModal),
      error: () => this._onError(),
    });
  }

  private _onSuccess(
    { resultados, paginacion, anidado }: PagedResult, // ← anidado viene del servicio
    mostrarModal: boolean,
  ): void {
    this.buscando.set(false);
    this._cache.set(paginacion.page, resultados);
    const todos = Array.from(this._cache.values()).flat();
    this._todosResultadosPlanos.set(todos);
    this.resultados.set(resultados);
    this._paginacion.set(paginacion);

    if (!mostrarModal) return;

    resultados.length === 0
      ? this.modal.info(
          'Sin resultados',
          'No se encontraron registros con los criterios ingresados.',
        )
      : this.modal.success('Búsqueda exitosa', `Se encontraron ${paginacion.total} registros.`);
  }

  private _onError(): void {
    this.buscando.set(false);
    this.modal.error('Error de búsqueda', 'Ocurrió un error al intentar conectar con el servidor.');
  }

  exportarExcel(imagenBase64: string | null = null): void {
    if (!BusquedaEstadisticaMapper.tieneCriterios(this.form())) {
      this.modal.info('Criterios requeridos', 'Debes ingresar al menos un criterio para exportar.');
      return;
    }

    this.exportando.set(true);

    this.busquedaEstadistica
      .exportarExcel(this.form(), imagenBase64)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.exportando.set(false)),
      )
      .subscribe({
        next: (blob) => this.descargarArchivo(blob, 'xlsx'),
        error: () =>
          this.modal.error('Error al exportar', 'No se pudo generar el Excel. Intenta de nuevo.'),
      });
  }
  private descargarArchivo(blob: Blob, extension: 'xlsx' | 'pdf'): void {
    const fecha = new Date().toISOString().slice(0, 10);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `reporte_estadisticas_${fecha}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  limpiar(): void {
    this.form.set({ ...FORM_VACIO });
    this.resultados.set([]);
    this._todosResultadosPlanos.set([]);
    this.dataJerarquica.set([]);
    this.chartActivo.set(null);
    this._limpiarCache();
  }
}

import { ResultadoBusquedaPlana, searchFormPlana, PagedResultPlana } from "../models/buscador-plano.model";
import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BuscadorPlanoService } from "../data/buscadorPlano.service";
import { ModalService } from '../../../../shared/components/modal-custom/services/modal.service';
import { finalize } from 'rxjs';
import { BusquedaPlanoMapper } from "../utils/buscadorPlano.mapper";

export const FORM_VACIO = {
  folioOficialia: '',
  folioApelacion: '',
  idSala: '',
  idApelacion: '',
  idNomenclatura: '',
  expedienteCausa: '',
  observacion: '',
  fechaInicio: '',
  fechaFin: ''
}

@Injectable({ providedIn: 'root' })
export class BusquedaPlanaFacade {

  private readonly busquedaService = inject(BuscadorPlanoService);
  private readonly destroyRef      = inject(DestroyRef);
  private readonly modal           = inject(ModalService);
  private _cache = new Map<number, ResultadoBusquedaPlana[]>();

  readonly form = signal<searchFormPlana>({ ...FORM_VACIO });

  // ── Estado
  readonly buscando   = signal(false);
  readonly exportando = signal(false);
  readonly generando  = signal(false);

  readonly resultados = signal<ResultadoBusquedaPlana[]>([]);

  private readonly _paginacion = signal({ total: 0, page: 1, limit: 10 });
  private readonly _porPagina  = signal(10);

  // ── Computed
  readonly porPagina       = computed(() => this._porPagina());
  readonly paginaActual    = computed(() => this._paginacion().page);
  readonly totalResultados = computed(() => this._paginacion().total);
  readonly totalPaginas    = computed(() =>
    Math.ceil(this._paginacion().total / this._paginacion().limit) || 1
  );

  // ── Búsqueda
  buscar(): void {
    if (!BusquedaPlanoMapper.tieneCriterios(this.form())) {
      this.modal.info('Criterios requeridos', 'Debes ingresar al menos un criterio de búsqueda.');
      return;
    }
    this._limpiarCache();
    this._ejecutarBusqueda(1, true);
  }

  private _ejecutarBusqueda(page: number, mostrarModal: boolean): void {
    this.buscando.set(true);

    this.busquedaService.buscarPlana(this.form(), page, this.porPagina())
      .subscribe({
        next:  res => this._onSuccess(res, mostrarModal),
        error: ()  => this._onError(),
      });
  }

  private _onSuccess(res: PagedResultPlana, mostrarModal: boolean): void {
    this.buscando.set(false);
    this._cache.set(res.paginacion.page, res.resultados);
    this.resultados.set(res.resultados);
    this._paginacion.set(res.paginacion);

    if (!mostrarModal) return;

    res.resultados.length === 0
      ? this.modal.info('Sin resultados', 'No se encontraron registros con los criterios ingresados.')
      : this.modal.success('Búsqueda exitosa', `Se encontraron ${res.paginacion.total} registros.`);
  }

  private _onError(): void {
    this.buscando.set(false);
    this.modal.error('Error de búsqueda', 'Ocurrió un error al intentar conectar con el servidor.');
  }

  // ── Paginación
  irPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;

    if (this._cache.has(pagina)) {
      this.resultados.set(this._cache.get(pagina)!);
      this._paginacion.update(p => ({ ...p, page: pagina }));
      return;
    }

    this._ejecutarBusqueda(pagina, false);
  }

  cambiarPorPagina(limit: number): void {
    this._porPagina.set(limit);
    this._limpiarCache();
    this._ejecutarBusqueda(1, false);
  }

  // ── Exportar Excel
  exportarExcel(): void {
    if (!BusquedaPlanoMapper.tieneCriterios(this.form())) {
      this.modal.info('Criterios requeridos', 'Debes ingresar al menos un criterio para exportar.');
      return;
    }
    this.exportando.set(true);
    this.busquedaService.exportarExcel(this.form())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.exportando.set(false)),
      )
      .subscribe({
        next:  (blob) => this.descargarArchivo(blob, 'xlsx'),
        error: ()     => this.modal.error('Error al exportar', 'No se pudo generar el Excel. Intenta de nuevo.'),
      });
  }

  // ── Exportar PDF
  exportarPdf(): void {
    if (!BusquedaPlanoMapper.tieneCriterios(this.form())) {
      this.modal.info('Criterios requeridos', 'Debes ingresar al menos un criterio para exportar.');
      return;
    }
    this.generando.set(true);
    this.busquedaService.exportarPdf(this.form())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.generando.set(false)),
      )
      .subscribe({
        next:  (blob) => this.descargarArchivo(blob, 'pdf'),
        error: ()     => this.modal.error('Error al exportar', 'No se pudo generar el PDF. Intenta de nuevo.'),
      });
  }

  // ── Descarga genérica
  private descargarArchivo(blob: Blob, extension: 'xlsx' | 'pdf'): void {
    const fecha  = new Date().toISOString().slice(0, 10);
    const url    = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href     = url;
    anchor.download = `reporte_plano_${fecha}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  // ── Limpiar
  limpiar(): void {
    this.form.set({ ...FORM_VACIO });
    this.resultados.set([]);
    this._limpiarCache();
  }

  private _limpiarCache(): void {
    this._cache.clear();
    this._paginacion.update(p => ({ ...p, total: 0, page: 1 }));
  }
}

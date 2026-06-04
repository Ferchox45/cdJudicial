import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../../../shared/components/modal-custom/services/modal.service';
import { ResultadoBusquedaHistorica, SearchFormHistorico, PagedResultHistorico} from '../models/buscador-historico.model';
import { BuscadoresService } from '../data/buscadorHistorico.service';
import { BusquedaHistoricoMapper } from '../utils/buscadorHistorico.mapper';
import { finalize } from 'rxjs';

export const FORM_VACIO = {
  expedienteCausa: '',
  toca: '',
  idSala: '',
  fechaRecepcionInicial: '',
  fechaRecepcionFinal: '',
  fechaApelacionInicial: '',
  fechaApelacionFinal: '',
  imputado: '',
  victima: '',
  delito: '',
  observacion: '',
}

@Injectable({ providedIn: 'root' })
export class BuscarFacade {

  private readonly busquedaService = inject(BuscadoresService);
  private readonly destroyRef      = inject(DestroyRef);
  private readonly modal           = inject(ModalService);
  private readonly _cache = new Map<number, ResultadoBusquedaHistorica[]>();

  readonly form = signal<SearchFormHistorico>({ ...FORM_VACIO });

  // ── Estado
  readonly buscando   = signal(false);
  readonly exportando = signal(false);
  readonly generando  = signal(false);


  readonly resultados  = signal<ResultadoBusquedaHistorica[]>([]);
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
    if (!BusquedaHistoricoMapper.tieneCriterios(this.form())) {
      this.modal.error('Error', 'Por favor, complete al menos un campo de búsqueda.');
      return;
    }
    this.limpiarCache();
    this.ejecutarBusqueda(1, true);
  }

  private ejecutarBusqueda(page: number, mostrarModal: boolean): void {
    this.buscando.set(true);

    this.busquedaService
      .buscarHistorico(this.form(), page, this.porPagina())
      .subscribe({
        next:  res => this._onSuccess(res, mostrarModal),
        error: ()  => this._onError(),
      });
  }

  private _onSuccess(res: PagedResultHistorico, mostrarModal: boolean): void {
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

    this.ejecutarBusqueda(pagina, false);
  }

  cambiarPorPagina(limit: number): void {
    this._porPagina.set(limit);
    this.limpiarCache();
    this.ejecutarBusqueda(1, false);
  }

  // ── Exportar Excel
  exportarExcel(): void {
    if (!BusquedaHistoricoMapper.tieneCriterios(this.form())) {
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
    if (!BusquedaHistoricoMapper.tieneCriterios(this.form())) {
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
    anchor.download = `reporte_historico_${fecha}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  // ── Limpiar
  limpiar(): void {
    this.form.set({ ...FORM_VACIO });
    this.resultados.set([]);
    this.limpiarCache();
  }

  private limpiarCache(): void {
    this._cache.clear();
    this._paginacion.update(p => ({ ...p, total: 0, page: 1 }));
  }
}

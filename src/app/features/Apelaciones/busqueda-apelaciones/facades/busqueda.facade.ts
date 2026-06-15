import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { BusquedaProfService } from '../data/busquedaprof.service';
import { PagedResultProf, Resultado, SearchForm } from '../models/busqueda-profunda.model';
import { BusquedaApelacionesMapper } from '../utils/busquedaApelaciones.mapper';
import { ModalService } from '../../../../shared/components/modal-custom/services/modal.service';

export const FORM_VACIO: SearchForm = {
  folioOficialia:  '',
  folioApelacion:  '',
  expedienteCausa: '',
  nombreParte:     '',
  idSala:          '',
  idNomenclatura:  '',
  idApelacion:     '',
  fechaInicio:     '',
  fechaFin:        '',
};

@Injectable()
export class BusquedaFacade {

  private readonly busquedaService = inject(BusquedaProfService);
  private readonly destroyRef      = inject(DestroyRef);
  private readonly modal           = inject(ModalService);

  // ── Caché ─────────────────────────────────────────────────────────────
  private readonly cache = new Map<number, Resultado[]>();

  // ── Estado ────────────────────────────────────────────────────────────
  readonly form = signal<SearchForm>({ ...FORM_VACIO });

  readonly buscando   = signal(false);
  readonly exportando = signal(false);
  readonly generando  = signal(false);

  readonly resultados = signal<Resultado[]>([]);
  private readonly _paginacion = signal({ total: 0, page: 1, limit: 10 });
  private readonly _porPagina  = signal(10);

  private readonly _filaSeleccionada = signal<Resultado | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────
  readonly porPagina        = computed(() => this._porPagina());
  readonly paginaActual     = computed(() => this._paginacion().page);
  readonly filaSeleccionada = computed(() => this._filaSeleccionada());
  readonly totalResultados  = computed(() => this._paginacion().total);

  readonly totalPaginas = computed(() =>
    Math.ceil(this._paginacion().total / this._paginacion().limit) || 1
  );

  // Metodo Buscar
  buscar(): void {
    if (!BusquedaApelacionesMapper.tieneCriterios(this.form())) {
      this.modal.info('Criterios requeridos', 'Debes ingresar al menos un criterio de búsqueda.');
      return;
    }
    this.limpiarCache();
    this.ejecutarBusqueda(1, true);
  }

  private ejecutarBusqueda(page: number, mostrarModal: boolean): void {
    this.buscando.set(true);
    this.busquedaService
      .buscarApelaciones(this.form(), page, this.porPagina())
      .subscribe({
        next:  res => this._onSuccess(res, mostrarModal),
        error: ()  => this._onError(),
      });
  }

  private _onSuccess(res: PagedResultProf, mostrarModal: boolean): void {
    this.buscando.set(false);

    // Almacenamos en caché y actualizamos las señales
    this.cache.set(res.paginacion.page, res.resultados);
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

  // ── Paginación — usa caché, solo va al backend si no tiene la página ──
  irPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;

    this._filaSeleccionada.set(null); // Limpia selección al cambiar de página

    // Verifica si la página ya existe en el caché
    if (this.cache.has(pagina)) {
      this.resultados.set(this.cache.get(pagina)!);
      this._paginacion.update(p => ({ ...p, page: pagina }));
      return;
    }

    // Si no está, dispara la petición http
    this.ejecutarBusqueda(pagina, false);
  }

  cambiarPorPagina(limit: number): void {
    this._porPagina.set(limit);
    if (this.resultados().length === 0)
      return;
    this._filaSeleccionada.set(null);
    this.limpiarCache();
    this.ejecutarBusqueda(1, false);
  }

  // Detalle de fila
  seleccionarFila(r: Resultado): void {
    const actual = this._filaSeleccionada();
    this._filaSeleccionada.set(actual === r ? null : r);
  }

  // Exportar Excel
  exportar(): void {
    if (!BusquedaApelacionesMapper.tieneCriterios(this.form())) {
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
        next:  (blob) => this._descargarArchivo(blob, 'xlsx'),
        error: ()     => this.modal.error('Error al exportar', 'No se pudo generar el reporte. Intenta de nuevo.'),
      });
  }

  // ── Exportar PDF ──────────────────────────────────────────────────────
  exportarPdf(): void {
    if (!BusquedaApelacionesMapper.tieneCriterios(this.form())) {
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
        next:  (blob) => this._descargarArchivo(blob, 'pdf'),
        error: ()     => this.modal.error('Error al exportar', 'No se pudo generar el PDF. Intenta de nuevo.'),
      });
  }

  // ── Descarga genérica ─────────────────────────────────────────────────
  private _descargarArchivo(blob: Blob, extension: 'xlsx' | 'pdf'): void {
    const fecha  = new Date().toISOString().slice(0, 10);
    const url    = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href     = url;
    anchor.download = `reporte_apelaciones_${fecha}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  // ── Limpiar ───────────────────────────────────────────────────────────
  limpiar(): void {
    this.form.set({ ...FORM_VACIO });
    this.resultados.set([]);
    this._filaSeleccionada.set(null);
    this.limpiarCache();
  }

  private limpiarCache(): void {
    this.cache.clear();
    this._paginacion.update(p => ({ ...p, total: 0, page: 1 }));
  }
}

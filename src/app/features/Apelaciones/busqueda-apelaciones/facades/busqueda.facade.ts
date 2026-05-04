import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { BusquedaProfService } from '../../../../core/services/busquedaprof.service';
import { Resultado, SearchForm } from '../../../../core/models/busqueda-profunda';
import { BusquedaApelacionesMapper } from '../busquedaApelaciones.mapper';
import { ModalService } from '../../../../shared/components/modal-custom/services/modal.service';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const POR_PAGINA = 10;

export const FORM_VACIO: SearchForm = {
  folioOficialia:  '',
  folioApelacion:  '',
  expedienteCausa: '',
  nombreParte:     '',
  idSala:          '',
  idNomenclatura:  '',
  idTipoApelacion: '',
  fechaInicio:     '',
  fechaFin:        '',
};

// ─────────────────────────────────────────────────────────────────────────────
// Facade
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class BusquedaFacade {

  private readonly busquedaService = inject(BusquedaProfService);
  private readonly destroyRef      = inject(DestroyRef);
  private modal = inject(ModalService);

  // ── Estado privado ──────────────────────────────────────────────────────────
  private readonly _todosResultados = signal<Resultado[]>([]);
  private readonly _paginaActual    = signal(1);
  private readonly _filaSeleccionada = signal<Resultado | null>(null);

  // ── Estado público (signals) ────────────────────────────────────────────────
  readonly buscando   = signal(false);
  readonly exportando = signal(false);
  readonly form       = signal<SearchForm>({ ...FORM_VACIO });

  // ── Computed ────────────────────────────────────────────────────────────────
  readonly totalResultados  = computed(() => this._todosResultados().length);
  readonly paginaActual     = computed(() => this._paginaActual());
  readonly filaSeleccionada = computed(() => this._filaSeleccionada());

  readonly totalPaginas = computed(() =>
    Math.ceil(this.totalResultados() / POR_PAGINA)
  );

  readonly paginaInicio = computed(() =>
    (this._paginaActual() - 1) * POR_PAGINA + 1
  );

  readonly paginaFin = computed(() =>
    Math.min(this._paginaActual() * POR_PAGINA, this.totalResultados())
  );

  readonly paginas = computed(() => {
    const actual = this._paginaActual();
    const total  = this.totalPaginas();
    const inicio = Math.max(1, actual - 1);
    const fin    = Math.min(total, actual + 1);
    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  });

  readonly resultadosPagina = computed(() => {
    const inicio = (this._paginaActual() - 1) * POR_PAGINA;
    return this._todosResultados().slice(inicio, inicio + POR_PAGINA);
  });

  // ── Búsqueda ─────────────────────────────────────────────────────────────────

  buscar(): void {
    if (!BusquedaApelacionesMapper.tieneCriterios(this.form())) {
      this.modal.info('Criterios requeridos','Debes ingresar al menos un criterio de búsqueda.');
      return;
    }

    this.buscando.set(true);

    this.busquedaService.buscarApelaciones(this.form()).subscribe({
      next:  (res) => this.onBuscarSuccess(res),
      error: ()    => this.onBuscarError(),
    });
  }

  private onBuscarSuccess(resultados: Resultado[]): void {
    this.buscando.set(false);
    this._todosResultados.set(resultados);
    this._paginaActual.set(1);
    this._filaSeleccionada.set(null);

    if (resultados.length === 0) {
      this.modal.info('Sin resultados', 'No se encontraron registros con los criterios ingresados.');
    } else {
      this.modal.success('Búsqueda exitosa', `Se encontraron ${resultados.length} registros.`);
    }
  }

  private onBuscarError(): void {
    this.buscando.set(false);
    this.modal.error('Error de búsqueda', 'Ocurrió un error al intentar conectar con el servidor.');
  }

  // ── Exportar ─────────────────────────────────────────────────────────────────

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
        next:  (blob) => this.descargarArchivo(blob),
        error: ()     => this.modal.error('Error al exportar', 'No se pudo generar el reporte. Intenta de nuevo.'),
      });
  }

  private descargarArchivo(blob: Blob): void {
    const fecha  = new Date().toISOString().slice(0, 10);
    const url    = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href     = url;
    anchor.download = `reporte_apelaciones_${fecha}.xlsx`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  // ── Limpiar ───────────────────────────────────────────────────────────────────

  limpiar(): void {
    this.form.set({ ...FORM_VACIO });
    this._todosResultados.set([]);
    this._paginaActual.set(1);
    this._filaSeleccionada.set(null);
  }

  // ── Paginación ────────────────────────────────────────────────────────────────

  irPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas()) {
      this._paginaActual.set(p);
      this._filaSeleccionada.set(null);
    }
  }

  // ── Detalle de fila ───────────────────────────────────────────────────────────

  seleccionarFila(r: Resultado): void {
    const actual = this._filaSeleccionada();
    this._filaSeleccionada.set(actual === r ? null : r);
  }
}

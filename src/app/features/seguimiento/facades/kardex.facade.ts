import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { SeguimientoService } from '../data/seguimiento.service';
import { ModalService } from '../../../shared/components/modal-custom/services/modal.service';
import { MovimientoKardex } from '../models/seguimiento.model';

@Injectable({ providedIn: 'root' })
export class KardexFacade {
  private service = inject(SeguimientoService);
  private modal = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  readonly folio = signal('');
  readonly movimientos = signal<MovimientoKardex[]>([]);
  readonly folioOficialia = signal('');
  readonly folioApelacion = signal<string | null>(null);
  readonly buscando = signal(false);
  readonly buscado = signal(false);
  readonly paginaActual = signal(1);
  readonly totalPaginas = signal(1);
  readonly totalResultados = signal(0);
  readonly porPagina = signal(0);

  buscar(): void {
    const folio = this.folio().trim();
    if (!folio) {
      this.modal.info('Folio requerido', 'Ingresa un folio de oficialía para consultar.');
      return;
    }

    this.buscando.set(true);
    this.buscado.set(false);

    this.service.getHistorial(folio)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.buscando.set(false)),
      )
      .subscribe({
        next: (res) => {
          this.folioOficialia.set(res.folioOficialia);
          this.folioApelacion.set(res.folioApelacion);
          this.movimientos.set(res.movimientos);
          this.totalResultados.set(res.movimientos.length);
          this.totalPaginas.set(1);
          this.buscado.set(true);

          if (res.movimientos.length === 0) {
            this.modal.info('Sin movimientos', 'No se encontraron movimientos para este folio.');
          }
        },
        error: () => {
          this.modal.error('Error de consulta', 'Ocurrió un error al consultar el historial.');
          this.buscado.set(true);
        },
      });
  }

  limpiar(): void {
    this.folio.set('');
    this.movimientos.set([]);
    this.folioOficialia.set('');
    this.folioApelacion.set(null);
    this.buscado.set(false);
  }
}

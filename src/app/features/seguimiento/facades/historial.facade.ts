import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { SeguimientoService } from '../data/seguimiento.service';
import { ModalService } from '../../../shared/components/modal-custom/services/modal.service';
import { SessionStateService } from '../../permisos/services/session-state.service';
import { MovimientoHistorial, CatalogoItem } from '../models/seguimiento.model';

@Injectable({ providedIn: 'root' })
export class HistorialFacade {
  private service = inject(SeguimientoService);
  private modal = inject(ModalService);
  private sessionState = inject(SessionStateService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    folioApelacion: [''],
    idNomenclatura: [null],
  });

  readonly nomenclaturas = signal<CatalogoItem[]>([]);
  readonly cargandoCatalogos = signal(false);

  readonly movimientos = signal<MovimientoHistorial[]>([]);
  readonly folioOficialia = signal('');
  readonly folioApelacionInfo = signal<string | null>(null);
  readonly buscando = signal(false);
  readonly buscado = signal(false);
  readonly paginaActual = signal(1);
  readonly totalPaginas = signal(1);
  readonly totalResultados = signal(0);
  readonly porPagina = signal(0);

  cargarCatalogos(): void {
    this.cargandoCatalogos.set(true);
    this.service.getCatalogosHistorial().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cargandoCatalogos.set(false)),
    ).subscribe({
      next: (res) => this.nomenclaturas.set(res.nomenclaturas),
      error: () => { /* ignorar */ },
    });
  }

  buscar(): void {
    const idSala = this.sessionState.idSala();
    if (idSala == null) {
      this.modal.info('Sala requerida', 'No se ha seleccionado una sala.');
      return;
    }

    this.buscando.set(true);
    this.buscado.set(false);

    const raw = this.form.value;
    const params: { idSala: number; folioApelacion?: string; idNomenclatura?: number } = { idSala };
    if (raw.folioApelacion?.trim()) params.folioApelacion = raw.folioApelacion.trim();
    if (raw.idNomenclatura != null) params.idNomenclatura = raw.idNomenclatura;

    this.service.getHistorial(params)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.buscando.set(false)),
      )
      .subscribe({
        next: (res) => {
          this.folioOficialia.set(res.folioOficialia);
          this.folioApelacionInfo.set(res.folioApelacion);
          this.movimientos.set(res.movimientos);
          this.totalResultados.set(res.movimientos.length);
          this.totalPaginas.set(1);
          this.buscado.set(true);

          if (res.movimientos.length === 0) {
            this.modal.info('Sin movimientos', 'No se encontraron movimientos.');
          }
        },
        error: () => {
          this.modal.error('Error de consulta', 'Ocurrió un error al consultar el historial.');
          this.buscado.set(true);
        },
      });
  }

  limpiar(): void {
    this.form.reset();
    this.movimientos.set([]);
    this.folioOficialia.set('');
    this.folioApelacionInfo.set(null);
    this.buscado.set(false);
  }
}
import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { SeguimientoService } from '../data/seguimiento.service';
import { ModalService } from '../../../shared/components/modal-custom/services/modal.service';
import { SessionStateService } from '../../permisos/services/session-state.service';
import { MovimientoPendiente } from '../models/seguimiento.model';

@Injectable({ providedIn: 'root' })
export class RecibirFacade {
  private service = inject(SeguimientoService);
  private modal = inject(ModalService);
  private sessionState = inject(SessionStateService);
  private destroyRef = inject(DestroyRef);
  private _cache = new Map<number, MovimientoPendiente[]>();

  private readonly idPerfil = computed(() => this.sessionState.idPerfil());
  private readonly idSala = computed(() => this.sessionState.idSala());
  private readonly idAreaSistemaUsuario = computed(() => this.sessionState.idAreaSistemaUsuario());
  private readonly idPantalla = computed(() => this.sessionState.idPantalla());

  readonly pendientes = signal<MovimientoPendiente[]>([]);
  readonly idsSeleccionados = signal<number[]>([]);
  readonly recibiendo = signal(false);
  readonly cargando = signal(false);

  private _paginacion = signal({ total: 0, page: 1, limit: 10 });
  private _porPagina = signal(10);

  readonly porPagina = computed(() => this._porPagina());
  readonly paginaActual = computed(() => this._paginacion().page);
  readonly totalResultados = computed(() => this._paginacion().total);
  readonly totalPaginas = computed(
    () => Math.ceil(this._paginacion().total / this._paginacion().limit) || 1,
  );

  readonly seleccionCount = computed(() => this.idsSeleccionados().length);
  readonly haySeleccion = computed(() => this.idsSeleccionados().length > 0);

  toggleSeleccion(id: number): void {
    this.idsSeleccionados.update((ids) => {
      if (ids.includes(id)) return ids.filter((i) => i !== id);
      return [...ids, id];
    });
  }

  toggleSeleccionTodos(ids: number[]): void {
    const actuales = this.idsSeleccionados();
    const todosSeleccionados = ids.every((id) => actuales.includes(id));
    if (todosSeleccionados) {
      this.idsSeleccionados.set([]);
    } else {
      this.idsSeleccionados.set([...ids]);
    }
    this.pendientes.update((rows) =>
      rows.map((r) => ({ ...r, seleccionado: !todosSeleccionados })),
    );
  }

  limpiar(): void {
    this.idsSeleccionados.set([]);
    this.pendientes.set([]);
    this._cache.clear();
    this._paginacion.set({ total: 0, page: 1, limit: 10 });
  }

  cargar(): void {
    this.idsSeleccionados.set([]);
    this._cache.clear();
    this._ejecutarCarga(1, true);
  }

  private _ejecutarCarga(page: number, mostrarModal: boolean): void {
    const perfil = this.idPerfil();
    const sala = this.idSala();
    const idArea = this.idAreaSistemaUsuario();
    const idPant = this.idPantalla();
    if (perfil == null || sala == null || idArea == null || idPant == null) return;

    this.cargando.set(true);

    this.service
      .getPendientesRecibir({
        idSala: sala,
        idPerfil: perfil,
        pagina: page,
        limite: this.porPagina(),
        idAreaSistemaUsuario: idArea,
        idPantalla: idPant,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (res) => {
          const resultados = res.resultados.map((r) => ({
            ...r,
            id: Number(r.id),
            seleccionado: false,
          }));
          this._cache.set(page, resultados);
          this.pendientes.set(resultados);
          this._paginacion.set({ ...res.paginacion, total: res.paginacion.total });

          if (mostrarModal && resultados.length === 0) {
            this.modal.info('Sin pendientes', 'No hay movimientos pendientes de recibir.');
          }
        },
        error: () => {
          this.modal.error('Error de carga', 'Ocurrió un error al obtener los pendientes.');
        },
      });
  }

  recibir(): void {
    const ids = this.idsSeleccionados();
    if (ids.length === 0) {
      this.modal.info('Sin selección', 'Selecciona al menos un movimiento para recibir.');
      return;
    }

    this.recibiendo.set(true);

    const idArea = this.idAreaSistemaUsuario();
    const idPant = this.idPantalla();
    if (idArea == null || idPant == null) {
      this.modal.error('Error', 'No se encontraron los parámetros de sesión.');
      return;
    }

    this.service
      .recibir(ids.map(Number), idArea, idPant)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.recibiendo.set(false)),
      )
      .subscribe({
        next: (res) => {
          this.modal.success(
            'Recepción exitosa',
            `Se recibieron ${res.afectados} de ${res.total} movimientos correctamente`,
          );
          this.idsSeleccionados.set([]);
          this._cache.clear();
          this._ejecutarCarga(1, false);
        },
        error: () => {
          this.modal.error('Error de recepción', 'Ocurrió un error al recibir los movimientos.');
        },
      });
  }

  irPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;

    if (this._cache.has(pagina)) {
      this.pendientes.set(this._cache.get(pagina)!);
      this._paginacion.update((p) => ({ ...p, page: pagina }));
      return;
    }

    this._ejecutarCarga(pagina, false);
  }

  cambiarPorPagina(limit: number): void {
    this._porPagina.set(limit);
    if (this.pendientes().length === 0) return;
    this._cache.clear();
    this._ejecutarCarga(1, false);
  }

  refrescar(): void {
    this._cache.clear();
    this._ejecutarCarga(1, true);
  }
}

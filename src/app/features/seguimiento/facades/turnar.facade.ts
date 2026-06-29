import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { SeguimientoService } from '../data/seguimiento.service';
import { ModalService } from '../../../shared/components/modal-custom/services/modal.service';
import { SessionStateService } from '../../permisos/services/session-state.service';
import {
  ApelacionTurnable,
  OpcionesTurnar,
} from '../models/seguimiento.model';

@Injectable({ providedIn: 'root' })
export class TurnarFacade {
  private service = inject(SeguimientoService);
  private modal = inject(ModalService);
  private sessionState = inject(SessionStateService);
  private destroyRef = inject(DestroyRef);
  private _cache = new Map<number, ApelacionTurnable[]>();

  readonly idPerfil = computed(() => this.sessionState.idPerfil());
  readonly idSala = computed(() => this.sessionState.idSala());
  private readonly idAreaSistemaUsuario = computed(() => this.sessionState.idAreaSistemaUsuario());
  private readonly idPantalla = computed(() => this.sessionState.idPantalla());

  readonly turnables = signal<ApelacionTurnable[]>([]);
  readonly opcionesTurnar = signal<OpcionesTurnar | null>(null);
  readonly idsSeleccionados = signal<number[]>([]);
  readonly destinoSeleccionado = signal<number | null>(null);
  readonly idGeneralDestino = signal<number | null>(null);
  readonly salaSeleccionadaEnTurnar = signal<number | null>(null);
  readonly turnando = signal(false);
  readonly cargando = signal(false);
  readonly cargandoCatalogos = signal(false);

  readonly verificandoPendientes = signal(false);

  private _paginacion = signal({ total: 0, page: 1, limit: 10 });
  private _porPagina = signal(10);

  readonly porPagina = computed(() => this._porPagina());
  readonly paginaActual = computed(() => this._paginacion().page);
  readonly totalResultados = computed(() => this._paginacion().total);
  readonly totalPaginas = computed(() =>
    Math.ceil(this._paginacion().total / this._paginacion().limit) || 1,
  );

  readonly tieneSalaSesion = computed(() => this.sessionState.idSala() != null);
  readonly currentIdSala = computed(() =>
    this.tieneSalaSesion() ? this.sessionState.idSala() : this.salaSeleccionadaEnTurnar(),
  );

  readonly perfilActual = computed(() => this.idPerfil());
  readonly perfilesDestino = computed(() => this.opcionesTurnar()?.perfilesDestino ?? []);
  readonly proyectistas = computed(() => this.opcionesTurnar()?.proyectistas ?? []);
  readonly magistrados = computed(() => this.opcionesTurnar()?.magistrados ?? []);

  readonly modoSoloUnPerfil = computed(() =>
    this.opcionesTurnar() != null && this.perfilesDestino().length <= 1,
  );

  readonly seleccionCount = computed(() => this.idsSeleccionados().length);
  readonly haySeleccion = computed(() => this.idsSeleccionados().length > 0);

  readonly requiereProyectista = computed(() => {
    if (this.proyectistas().length === 0 || this.destinoSeleccionado() == null) return false;
    const destino = this.perfilesDestino().find(p => p.id === this.destinoSeleccionado());
    return destino != null && /proyectista/i.test(destino.descripcion);
  });

  readonly requiereMagistrado = computed(() => {
    if (this.magistrados().length === 0 || this.destinoSeleccionado() == null) return false;
    const destino = this.perfilesDestino().find(p => p.id === this.destinoSeleccionado());
    return destino != null && /magistrado/i.test(destino.descripcion);
  });

  readonly turnarHabilitado = computed(() =>
    this.idsSeleccionados().length > 0
    && this.destinoSeleccionado() != null
    && (!this.requiereProyectista() || this.idGeneralDestino() != null)
    && (!this.requiereMagistrado() || this.idGeneralDestino() != null),
  );

  readonly tieneTurnables = computed(() => this.turnables().length > 0);

  toggleSeleccion(id: number): void {
    this.idsSeleccionados.update(ids => {
      if (ids.includes(id)) return ids.filter(i => i !== id);
      return [...ids, id];
    });
  }

  seleccionarDestino(id: number): void {
    this.destinoSeleccionado.set(id);
    this.idGeneralDestino.set(null);
  }

  seleccionarIdGeneralDestino(id: number): void {
    this.idGeneralDestino.set(id);
  }

  seleccionarSala(id: number | null): void {
    this.salaSeleccionadaEnTurnar.set(id);
    if (id != null) {
      this._cache.clear();
      this._ejecutarCarga(1, true);
    }
  }

  limpiar(): void {
    this.turnables.set([]);
    this.opcionesTurnar.set(null);
    this.idsSeleccionados.set([]);
    this.destinoSeleccionado.set(null);
    this.idGeneralDestino.set(null);
    this.salaSeleccionadaEnTurnar.set(null);
    this._cache.clear();
    this._paginacion.set({ total: 0, page: 1, limit: 10 });
  }

  verificarPendientes(): void {
    const perfil = this.idPerfil();
    const sala = this.idSala();
    const idArea = this.idAreaSistemaUsuario();
    const idPant = this.idPantalla();
    if (perfil == null || sala == null || idArea == null || idPant == null) return;

    this.verificandoPendientes.set(true);
    this.service.getPendientesRecibir({ idSala: sala, idPerfil: perfil, pagina: 1, limite: 1, idAreaSistemaUsuario: idArea, idPantalla: idPant })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.verificandoPendientes.set(false)),
      )
      .subscribe({
        next: (res) => {
          if (res.paginacion.total > 0) {
            this.modal.info(
              'Pendientes por recibir',
              `Tienes ${res.paginacion.total} movimiento(s) pendiente(s) de recibir. Debes recibirlos antes de turnar.`,
            );
          }
        },
        error: () => { /* ignorar */ },
      });
  }

  cargarCatalogos(): void {
    const perfil = this.idPerfil();
    const idArea = this.idAreaSistemaUsuario();
    const idPant = this.idPantalla();
    if (perfil == null || idArea == null || idPant == null) return;

    this.cargandoCatalogos.set(true);
    this.service.getOpcionesTurnar(perfil, idArea, idPant)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoCatalogos.set(false)),
      )
      .subscribe({
        next: (opciones) => {
          this.opcionesTurnar.set(opciones);
          if (opciones.perfilesDestino.length === 1) {
            this.destinoSeleccionado.set(opciones.perfilesDestino[0].id);
            this.idGeneralDestino.set(null);
          }
        },
        error: () => this.modal.error('Error', 'No se pudieron cargar las opciones de turno.'),
      });
  }

  cargarTurnables(): void {
    const perfil = this.idPerfil();
    if (perfil == null) return;
    if (this.tieneSalaSesion()) {
      if (this.idSala() == null) return;
    } else {
      if (this.salaSeleccionadaEnTurnar() == null) return;
    }

    this._cache.clear();
    this._ejecutarCarga(1, true);
  }

  private _ejecutarCarga(page: number, mostrarModal: boolean): void {
    const perfil = this.idPerfil();
    const sala = this.currentIdSala();
    const idArea = this.idAreaSistemaUsuario();
    const idPant = this.idPantalla();
    if (perfil == null || sala == null || idArea == null || idPant == null) return;

    this.cargando.set(true);

    this.service.getApelacionesTurnar({
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
          const turnables = res.resultados.map(r => ({
            ...r,
            idApelacion: Number(r.idApelacion),
            seleccionado: false,
          }));
          this._cache.set(page, turnables);
          this.turnables.set(turnables);
          this._paginacion.set({ ...res.paginacion, total: res.paginacion.total });

          if (mostrarModal && res.resultados.length === 0) {
            this.modal.info('Sin turnos', 'No hay apelaciones pendientes de turnar.');
          }
        },
        error: () => {
          this.modal.error('Error de carga', 'Ocurrió un error al obtener las apelaciones.');
        },
      });
  }

  turnar(): void {
    const destino = this.destinoSeleccionado();
    const perfil = this.idPerfil();
    const idArea = this.idAreaSistemaUsuario();
    const idPant = this.idPantalla();
    if (destino == null || perfil == null || idArea == null || idPant == null) return;

    const ids = this.idsSeleccionados().map(Number);
    if (ids.length === 0) return;

    this.turnando.set(true);

    this.service.turnar({
      ids,
      idPerfilOrigen: perfil,
      idPerfilDestino: destino,
      idGeneralDestino: this.idGeneralDestino(),
      idAreaSistemaUsuario: idArea,
      idPantalla: idPant,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.turnando.set(false)),
      )
      .subscribe({
        next: (res) => {
          this.modal.success('Turno exitoso', `Se turnaron ${res.afectados} de ${res.total} tocas correctamente`);
          this.destinoSeleccionado.set(null);
          this.idGeneralDestino.set(null);
          this.idsSeleccionados.set([]);
          this._cache.clear();
          this._ejecutarCarga(1, false);
        },
        error: () => {
          this.modal.error('Error de turno', 'Ocurrió un error al turnar la apelación.');
        },
      });
  }

  irPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;

    if (this._cache.has(pagina)) {
      this.turnables.set(this._cache.get(pagina)!);
      this._paginacion.update(p => ({ ...p, page: pagina }));
      return;
    }

    this._ejecutarCarga(pagina, false);
  }

  cambiarPorPagina(limit: number): void {
    this._porPagina.set(limit);
    if (this.turnables().length === 0) return;
    this._cache.clear();
    this._ejecutarCarga(1, false);
  }

  refrescar(): void {
    this.destinoSeleccionado.set(null);
    this.idGeneralDestino.set(null);
    this.idsSeleccionados.set([]);
    this.cargarCatalogos();
    this._cache.clear();
    this._ejecutarCarga(1, true);
  }
}

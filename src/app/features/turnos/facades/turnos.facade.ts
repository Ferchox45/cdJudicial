import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TurnosService } from '../data/turnos.service';
import { ModalService } from '../../../shared/components/modal-custom/services/modal.service';
import { TurnosMapper } from '../utils/turnos.mapper';
import { TurnoListItemDTO, TurnoSearchForm, TurnoSala } from '../models/turnos.model';
import { CatalogoItem } from '../../../core/models/catalogo-global.model';

export const FORM_VACIO: TurnoSearchForm = {
  folioOficialia: '',
  folioApelacion: '',
  idSala: '',
  fechaRecepcionInicio: '',
  fechaRecepcionFin: '',
  idNomenclatura: '',
  estado: '',
};

export type TurnosPerfilTipo = 'comun' | 'oficialia';

@Injectable({ providedIn: 'root' })
export class TurnosFacade {
  private readonly service = inject(TurnosService);
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _cache = new Map<number, TurnoListItemDTO[]>();

  readonly form = signal<TurnoSearchForm>({ ...FORM_VACIO });

  readonly buscando = signal(false);

  readonly resultados = signal<TurnoListItemDTO[]>([]);
  private readonly _paginacion = signal({ total: 0, page: 1, limit: 10 });
  private readonly _porPagina = signal(10);

  readonly porPagina = computed(() => this._porPagina());
  readonly paginaActual = computed(() => this._paginacion().page);
  readonly totalResultados = computed(() => this._paginacion().total);
  readonly totalPaginas = computed(() =>
    Math.ceil(this._paginacion().total / this._paginacion().limit) || 1
  );

  readonly idsSeleccionados = signal<number[]>([]);
  readonly perfilTipo = signal<TurnosPerfilTipo>('comun');

  readonly exportando = signal(false);
  readonly importando = signal(false);

  readonly salas = signal<TurnoSala[]>([]);
  readonly nomenclaturas = signal<CatalogoItem[]>([]);
  readonly cargandoCatalogos = signal(false);

  readonly seleccionCount = computed(() => this.idsSeleccionados().length);
  readonly haySeleccion = computed(() => this.idsSeleccionados().length > 0);

  private readonly idPerfil = computed<number>(() =>
    this.perfilTipo() === 'comun' ? 2 : 3,
  );

  cargarCatalogos(): void {
    this.cargandoCatalogos.set(true);
    this.service.getCatalogos().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cargandoCatalogos.set(false)),
    ).subscribe({
      next: (cat) => {
        this.salas.set(cat.salas);
        this.nomenclaturas.set(cat.nomenclaturas);
      },
      error: () => this.modal.error('Error', 'No se pudieron cargar los catálogos.'),
    });
  }

  toggleSeleccion(id: number): void {
    this.idsSeleccionados.update(ids => {
      if (ids.includes(id)) return ids.filter(i => i !== id);
      return [...ids, id];
    });
  }

  toggleSeleccionTodos(ids: number[]): void {
    const actuales = this.idsSeleccionados();
    const todosSeleccionados = ids.every(id => actuales.includes(id));
    if (todosSeleccionados) {
      this.idsSeleccionados.set([]);
    } else {
      this.idsSeleccionados.set([...ids]);
    }
    this.resultados.update(rows =>
      rows.map(r => ({ ...r, seleccionado: !todosSeleccionados })),
    );
  }

  buscar(): void {
    if (!TurnosMapper.tieneCriterios(this.form())) {
      this.modal.info('Sala requerida', 'Debes seleccionar una sala para realizar la búsqueda.');
      return;
    }
    this.idsSeleccionados.set([]);
    this._limpiarCache();
    this._ejecutarBusqueda(1, true);
  }

  private _ejecutarBusqueda(page: number, mostrarModal: boolean): void {
    this.buscando.set(true);
    const filtros = TurnosMapper.toDTO(this.form(), this.idPerfil());

    this.service.listar(filtros, page, this.porPagina())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.buscando.set(false)),
      )
      .subscribe({
        next: (res) => this._onSuccess(res, mostrarModal),
        error: () => this._onError(),
      });
  }

  private _onSuccess(
    res: { resultados: TurnoListItemDTO[]; paginacion: { total: number; page: number; limit: number } },
    mostrarModal: boolean,
  ): void {
    let resultados = res.resultados.map(r => {
      let estatus: string;
      if (r.estadoActual === 'importado') {
        estatus = 'Importado';
      } else if (r.estadoActual === 'exportado') {
        estatus = this.perfilTipo() === 'oficialia' ? 'Pendiente' : 'Exportado';
      } else {
        estatus = 'Pendiente';
      }

      return {
        ...r,
        seleccionado: false,
        _estatus: estatus,
        _colorEstatus:
          estatus === 'Pendiente' ? 'bg-gray-100 text-gray-700' :
          estatus === 'Exportado' ? 'bg-blue-100 text-blue-700' :
          'bg-green-100 text-green-700',
      };
    });

    this._cache.set(res.paginacion.page, resultados);
    this.resultados.set(resultados);
    this._paginacion.set({ ...res.paginacion, total: res.paginacion.total });

    if (!mostrarModal) return;

    if (resultados.length === 0) {
      this.modal.info('Sin resultados', 'No se encontraron registros con los criterios ingresados.');
    } else {
      this.modal.success('Búsqueda exitosa', `Se encontraron ${res.paginacion.total} registros.`);
    }
  }

  private _onError(): void {
    this.modal.error('Error de búsqueda', 'Ocurrió un error al intentar conectar con el servidor.');
  }

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
    if (this.resultados().length === 0)
      return;
    this._limpiarCache();
    this._ejecutarBusqueda(1, false);
  }

  limpiar(): void {
    this.form.set({ ...FORM_VACIO });
    this.resultados.set([]);
    this.idsSeleccionados.set([]);
    this._limpiarCache();
  }

  private _limpiarCache(): void {
    this._cache.clear();
    this._paginacion.update(p => ({ ...p, total: 0, page: 1 }));
  }

  exportar(): void {
    const ids = this.idsSeleccionados();
    if (ids.length === 0) {
      this.modal.info('Sin selección', 'Selecciona al menos una apelación para exportar.');
      return;
    }

    this.exportando.set(true);
    this.service.exportar(ids).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.exportando.set(false)),
    ).subscribe({
      next: (res) => {
        this.modal.success('Exportación exitosa', res.message);
        this.idsSeleccionados.set([]);
        const pagina = this._paginacion().page;
        this._limpiarCache();
        this._ejecutarBusqueda(pagina, false);
      },
      error: () => {
        this.modal.error('Error de exportación', 'Ocurrió un error al exportar las apelaciones.');
      },
    });
  }

  importar(): void {
    const ids = this.idsSeleccionados();
    if (ids.length === 0) {
      this.modal.info('Sin selección', 'Selecciona al menos una apelación para importar.');
      return;
    }

    this.importando.set(true);
    this.service.importar(ids).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.importando.set(false)),
    ).subscribe({
      next: (res) => {
        this.modal.success('Importación exitosa', res.message);
        this.idsSeleccionados.set([]);
        const pagina = this._paginacion().page;
        this._limpiarCache();
        this._ejecutarBusqueda(pagina, false);
      },
      error: () => {
        this.modal.error('Error de importación', 'Ocurrió un error al importar las apelaciones.');
      },
    });
  }
}


import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActionSidebarComponent, SidebarAction } from '../../../shared/components/action-sidebar/action-sidebar.component';
import { PanelIdentificacionComponent } from './components/panel-identificacion/panel-identificacion.component';
import { PanelPartesComponent } from './components/panel-partes/panel-partes.component';
import { PanelRelacionesComponent } from './components/panel-relaciones/panel-relaciones.component';
import { ModalAnexosComponent } from './components/modal-anexo/modal-anexo.component';
import { CertificacionModalComponent } from './components/certificacion-modal/certificacion-modal.component';
import { ApelacionApiService } from './data/captura-apelacion.service';
import { Parte, RelacionBusqueda } from './models/busqueda-rap.model';
import { CatalogosFacade } from './facades/catalogos.facade';
import { GuardarFacade} from './facades/guardar.facade';
import { BusquedaFacade } from './facades/busqueda.facade';
import { Router } from '@angular/router';
import { buildNuevaParte, buildNuevaRelacion } from './utils/captura-apelaciones.mapper';
import { DelitoDisponible } from './models/apelacion-aux.model';
import { ModalService } from '../../../shared/components/modal-custom/services/modal.service';
import { SessionStateService } from '../../permisos/services/session-state.service';
import { ApelacionContextService } from '../anexos/data/apelacion-context.service';
import { OnUnsavedChanges } from '../../../shared/guards/on-unsaved-changes';

@Component({
  selector: 'app-captura-apelacion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CatalogosFacade, BusquedaFacade, GuardarFacade],
  imports: [
    CommonModule, ReactiveFormsModule,
    ActionSidebarComponent,
    PanelIdentificacionComponent, PanelPartesComponent, PanelRelacionesComponent,
    ModalAnexosComponent, CertificacionModalComponent,
  ],
  templateUrl: './captura-apelaciones.component.html',
})
export class CapturaApelacionesComponent implements OnInit, OnDestroy, OnUnsavedChanges {

  cat = inject(CatalogosFacade);
  bus = inject(BusquedaFacade);
  grd = inject(GuardarFacade);
  private router = inject(Router);
  private fb  = inject(FormBuilder);
  private modal = inject(ModalService);
  private apelacionService = inject(ApelacionApiService);
  private sessionState = inject(SessionStateService);
  private contextoService = inject(ApelacionContextService);

  identificacionOpen = true;
  partesOpen         = true;
  datosGeneralesOpen = true;
  relacionesFinalesOpen = false;
  activeTab: 'partes' | 'relaciones' = 'partes';
  fechaActual = signal(new Date);

  mostrarModalAnexos = signal(false);
  mostrarCertificacion = signal(false);
  certBase64          = signal('');
  folioGuardado       = signal('');
  salaGuardada        = signal('');

  form!:      FormGroup;
  parteForm!: FormGroup;

  partes:     Parte[]            = [];
  relaciones: RelacionBusqueda[] = [];
  delitosDisponibles = signal<DelitoDisponible[]>([]);
  idsProcesadosSeleccionados = new Set<number>();
  idsOfendidosSeleccionados = new Set<number>();
  busquedaDelitoTexto = new FormControl('');
  mostrarFormParte    = false;

  guardando = signal(false);

  get sidebarActions(): SidebarAction[] {
    const isSaving = this.guardando();
    const importado = this.bus.importadoNS() === true;
    return [
      { id: 'nuevo',   label: 'Nuevo',   icon: 'nuevo',   primary: true, disabled: isSaving },
      { id: 'guardar', label: 'Guardar', icon: 'guardar', loading: isSaving, disabled: isSaving || importado },
      { id: 'buscar',  label: 'Buscar',  icon: 'buscar',  disabled: isSaving },
      { id: 'anexo',   label: 'Anexos',  icon: 'anexo',   disabled: !this.bus.tieneAnexos() || isSaving },
      { id: 'certificar', label: 'Certificar', icon: 'certificar', disabled: isSaving },
    ];
  }

  private intervalId?: ReturnType<typeof setInterval>;

  get esIndigena(): boolean {
    const id = this.form.get('materiaId')?.value;
    const desc = this.cat.materias().find(m => m.id === id)?.descripcion ?? '';
    return desc.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === 'indigena'
  }
  get procesados()       { return this.partes.filter(p => p.roleOrigin === 'procesado'); }
  get ofendidos()        { return this.partes.filter(p => p.roleOrigin === 'ofendido');  }
  get delitosFiltrados() {
    const q = this.busquedaDelitoTexto.value?.trim().toLowerCase() ?? '';
    const dd = this.delitosDisponibles();
    return q ? dd.filter(d => d.delito.toLowerCase().includes(q)) : dd;
  }

  ngOnInit(): void {
    this.buildForm();
    this.wireCallbacks();
    this.cat.cargar(this.form, 5);
    this.form.get('materiaId')!.valueChanges.subscribe(() => {
      this.bus.actualizarValidadoresPorMateria(this.form, this.esIndigena);
      this.activeTab = 'partes';
    });
    this.establecerPantalla();
    this.restaurarEstadoBusqueda();
  }

  private establecerPantalla(): void {
    const id = this.sessionState.buscarPantallaPorDescripcion('/capturaApelacion');
    if (id) this.sessionState.setPantalla(id);
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty || this.partes.length > 0 || this.relaciones.length > 0;
  }

  ngOnDestroy(): void { clearInterval(this.intervalId); }

private wireCallbacks(): void {
  this.cat.onDelitosListos = (d) => { this.delitosDisponibles.set(d); };
  this.cat.onError = (m) => this.modal.error('Error', m);

  this.bus.onExito = ({ partes, relaciones, delitosDisponibles }) => {
    this.partes = partes; this.relaciones = relaciones; this.delitosDisponibles.set(delitosDisponibles);
  };
  this.bus.onError = (m) => this.modal.error('Error', m);
  this.bus.onNuevo = () => { this.limpiarEstadoCaptura(); this.contextoService.clearSearchState(); };

      this.grd.onExito    = () =>{
    this.guardando.set(false);
    if (this.bus.apelacionId()) {
      this.modal.success('Éxito', 'Apelación guardada correctamente.');
      this.bus.resetNuevo(this.form);
      this.form.reset();
      this.limpiarEstadoCaptura();
    } else {
      this.mostrarModalAnexos.set(true);
      const materiaActual = this.esIndigena ? 6 : 5;
      this.actualizarFolioTentativo(materiaActual);
    }
  };

  this.grd.onTerminar = () => {
    this.guardando.set(false);
    this.limpiarEstadoCaptura();
    this.actualizarFolioTentativo(5);
  };

  this.grd.onError    = (m) => {
    this.guardando.set(false);
    this.modal.error('Error', m);
  };
}

  private guardarEstadoBusqueda(): void {
    this.contextoService.saveSearchState({
      formValues: this.form.getRawValue(),
      busquedaExitosa: this.bus.busquedaExitosa(),
      busquedaFallida: this.bus.busquedaFallida(),
      bloquearBtn: this.bus.bloquearBtn(),
      bloquearSeccion: this.bus.bloquearSeccion(),
      apelacionId: this.bus.apelacionId(),
      tieneAnexos: this.bus.tieneAnexos(),
      anexos: this.bus.anexos(),
      folioOficialia: this.bus.folioOficialia(),
      sala: this.bus.sala(),
      importadoNS: this.bus.importadoNS(),
      partes: this.partes,
      relaciones: this.relaciones,
      delitosDisponibles: this.delitosDisponibles(),
      idsProcesadosSeleccionados: [...this.idsProcesadosSeleccionados],
      idsOfendidosSeleccionados: [...this.idsOfendidosSeleccionados],
      busquedaDelitoTexto: this.busquedaDelitoTexto.value ?? '',
      busquedaRapida: this.form.get('busquedaRapida')?.value ?? '',
    });
  }

  private restaurarEstadoBusqueda(): boolean {
    const s = this.contextoService.getSearchState();
    if (!s) return false;

    this.form.patchValue(s.formValues);
    this.partes = s.partes ?? [];
    this.relaciones = s.relaciones ?? [];
    this.idsProcesadosSeleccionados = new Set(s.idsProcesadosSeleccionados ?? []);
    this.idsOfendidosSeleccionados = new Set(s.idsOfendidosSeleccionados ?? []);

    if (s.busquedaDelitoTexto) {
      this.busquedaDelitoTexto.setValue(s.busquedaDelitoTexto);
    }

    this.bus.apelacionId.set(s.apelacionId);
    this.bus.busquedaExitosa.set(s.busquedaExitosa);
    this.bus.busquedaFallida.set(s.busquedaFallida);
    this.bus.bloquearBtn.set(s.bloquearBtn);
    this.bus.bloquearSeccion.set(s.bloquearSeccion);
    this.bus.tieneAnexos.set(s.tieneAnexos);
    this.bus.anexos.set(s.anexos ?? []);
    this.bus.folioOficialia.set(s.folioOficialia);
    this.bus.sala.set(s.sala);
    this.bus.importadoNS.set(s.importadoNS ?? null);

    const savedIds = new Set(
      (s.delitosDisponibles ?? [])
        .filter((d: any) => d.seleccionado)
        .map((d: any) => d.id)
    );

    this.cat.onDelitosListos = (delitos) => {
      this.delitosDisponibles.set(
        delitos.map(d => ({ ...d, seleccionado: savedIds.has(d.id) }))
      );
      if (this.bus.bloquearSeccion()) {
        this.bus.bloquearCampos(this.form);
      }
    };

    this.delitosDisponibles.set(s.delitosDisponibles ?? []);

    this.contextoService.clearSearchState();
    return true;
  }

  private buildForm(): void {
    this.form = this.fb.group({
      busquedaRapida:      [''],
      materiaId:           [null, Validators.required],
      magistradoId:        [null],
      apelacionId:         [null], tipoApelacionId:     [null], tipoEscritoId:       [null],
      juzgadoId:           [null], municipioId:         [null], localidadId:         [null],
      etniaId:             [null], expedienteCausa:     [null], expedienteAcumulado: [null],
      fechaAuto:           [null],   folioOficio:         [null],   fojas:               [null],
      otroEtnia:           [null],
      asunto:              [null],   lugarHechos:         [null],
      esReposicion:        [false], observaciones:      [null],
      magistrados:         [{ value: '', disabled: true }],
      folioTentativo:      [{ value: '', disabled: true }],
    });
    this.parteForm = this.fb.group({
      nombre: ['', Validators.required], sexo: ['', Validators.required],
      tipoParte: ['', Validators.required], direccion: [''], esMenor: [false],
    });
  }

  handleAction(id: string): void {
    const actions: Record<string, () => void> = {
      nuevo:   () => { this.bus.resetNuevo(this.form); this.form.reset(); this.contextoService.clearSearchState(); },
      guardar: () => {
        if (this.bus.importadoNS()) {
          this.modal.info('Apelación importada', 'Esta apelación ya fue importada a un sistema externo y no puede ser modificada.');
          return;
        }
        this.form.markAllAsTouched();
        if (this.form.invalid) {
          this.modal.info('Advertencia', 'Rellena los campos obligatorios.');
          return;
        }
        if (this.partes.length === 0) {
          this.modal.info('Partes requeridas', 'Debe agregar al menos una parte antes de guardar la apelación.');
          return;
        }
        this.guardando.set(true);
        this.grd.guardar({
          form: this.form,
          relaciones: this.relaciones,
          partes: this.partes,
          sexos: this.cat.sexos(),
          tiposPartes: this.cat.tiposPartes(),
          folioGuardado: this.folioGuardado,
          salaGuardada: this.salaGuardada,
          esActualizacion: !!this.bus.apelacionId(),
          idTramite: this.bus.apelacionId() ?? undefined,
          onModalInvalido: () => {
            this.guardando.set(false);
            this.modal.info('Advertencia', 'Por favor, complete los campos obligatorios.');
          },
        });
      },
      anexo: () => {
        const id = this.bus.apelacionId();
        if (!id) return;
        this.guardarEstadoBusqueda();
        const anexosPrevios = (this.bus.anexos() ?? []).map(a => ({
          idAnexo: a.idAnexo,
          cantidad: a.cantidad,
          tipo: a.descripcion,
          esValor: a.esValor,
          monto: a.monto ? Number(a.monto) : null,
          otroAnexo: '',
        }));
        const folio = this.bus.folioOficialia() ?? this.form.get('busquedaRapida')?.value ?? '';
        this.contextoService.setContexto(id, folio, this.bus.sala() ?? '', anexosPrevios);
        this.router.navigate(['/capturaApelacion/anexos']);
      },
      certificar: () => {
        const id = this.bus.apelacionId();
        if (!id) {
          if (this.bus.busquedaFallida()) {
            this.modal.info('Aviso', 'Folio no valido');
          } else {
            this.modal.info('Aviso', 'Primero realice una búsqueda por folio.');
          }
          return;
        }
        this.apelacionService.certificarApelacion(id, this.sessionState.idPantalla(), this.sessionState.idAreaSistemaUsuario()).subscribe({
          next: (res) => {
            this.certBase64.set(res.certificacion);
            this.mostrarCertificacion.set(true);
          },
          error: () => this.modal.error('Error', 'Error al certificar la apelación.'),
        });
      },
      buscar: () => this.router.navigate(['capturaApelacion/busquedaApelacion']),
    };
    actions[id]?.();
  }

  actualizarFecha = effect((limpiarFechaHora)=>{
    const interval = setInterval(()=>{
      this.fechaActual.set(new Date());
    },1000);

  limpiarFechaHora(()=>{
    clearInterval(interval);
     })
  });

  agregarParte(): void {
    this.parteForm.reset({ nombre: '', sexo: '', tipoParte: '', direccion: '', esMenor: false });
    this.mostrarFormParte = true;
  }
  guardarParte(): void {
    if (this.parteForm.invalid) return;
    this.partes = [...this.partes, buildNuevaParte(this.parteForm.value)];
    this.mostrarFormParte = false;
  }

  agregarRelacionDesdePanel(): void {
    const procesadosSel = this.procesados.filter(p => this.idsProcesadosSeleccionados.has(p.id));
    const ofendidosSel = this.ofendidos.filter(p => this.idsOfendidosSeleccionados.has(p.id));
    const delitosSel = this.delitosDisponibles().filter(d => d.seleccionado);
    if (procesadosSel.length === 0 || ofendidosSel.length === 0) return;

    const nuevas: RelacionBusqueda[] = [];
    for (const proc of procesadosSel) {
      for (const ofen of ofendidosSel) {
        nuevas.push(buildNuevaRelacion(proc, ofen, delitosSel));
      }
    }
    this.relaciones = [...this.relaciones, ...nuevas];
    this.delitosDisponibles.set(this.delitosDisponibles().map(d => ({ ...d, seleccionado: false })));
    this.idsProcesadosSeleccionados = new Set();
    this.idsOfendidosSeleccionados = new Set();
    this.relacionesFinalesOpen = true;
  }

  eliminarDelitoDeRelacion(e: { relId: string; delitoId: number | string }): void {
    this.relaciones = this.relaciones
      .map(r => r.id === e.relId ? { ...r, delitosRelacion: r.delitosRelacion.filter(d => d.id !== Number(e.delitoId)) } : r)
      .filter(r => r.delitosRelacion.length > 0);
  }

  toggleDelito(d: DelitoDisponible): void {
    this.delitosDisponibles.update(dd => dd.map(x => x.id === d.id ? { ...x, seleccionado: !x.seleccionado } : x));
  }

  toggleProcesado(id: number): void {
    const next = new Set(this.idsProcesadosSeleccionados);
    next.has(id) ? next.delete(id) : next.add(id);
    this.idsProcesadosSeleccionados = next;
  }
  toggleOfendido(id: number): void {
    const next = new Set(this.idsOfendidosSeleccionados);
    next.has(id) ? next.delete(id) : next.add(id);
    this.idsOfendidosSeleccionados = next;
  }
  marcarTodosProcesados(): void {
    const ids = this.procesados.map(p => p.id);
    if (this.idsProcesadosSeleccionados.size === ids.length) {
      this.idsProcesadosSeleccionados = new Set();
    } else {
      this.idsProcesadosSeleccionados = new Set(ids);
    }
  }
  marcarTodosOfendidos(): void {
    const ids = this.ofendidos.map(p => p.id);
    if (this.idsOfendidosSeleccionados.size === ids.length) {
      this.idsOfendidosSeleccionados = new Set();
    } else {
      this.idsOfendidosSeleccionados = new Set(ids);
    }
  }

  private limpiarEstadoCaptura(): void {
    this.partes                      = [];
    this.relaciones                  = [];
    this.idsProcesadosSeleccionados  = new Set();
    this.idsOfendidosSeleccionados   = new Set();
    this.delitosDisponibles.update(dd => dd.map(d => ({ ...d, seleccionado: false })));
    this.busquedaDelitoTexto.setValue('');
  }
  private actualizarFolioTentativo(materia?: number): void {
  const materiaNum = materia ?? (this.esIndigena ? 6 : 5);
  this.cat.cargar(this.form, materiaNum);
  }
}

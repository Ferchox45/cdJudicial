
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActionSidebarComponent, SidebarAction } from '../../../shared/components/Action-siderbar/action-siderbar.component';
import { PanelIdentificacionComponent } from './components/panel-formulario/panel-formulario.component';
import { PanelPartesComponent } from './components/panel-partes/panel-partes.component';
import { PanelRelacionesComponent } from './components/panel-relaciones/panel-relaciones.component';
import { ModalAnexosComponent } from './components/modal-anexo/modal-anexo.component';
import { Parte, RelacionBusqueda } from './models/busqueda-rap.model';
import { CatalogosFacade,} from './facades/catalogos.facade';
import { GuardarFacade} from './facades/guardar.facade';
import { BusquedaFacade } from './facades/busqueda.facade';
import { Router } from '@angular/router';
import { buildNuevaParte, buildNuevaRelacion } from './utils/captura-apelaciones.mapper';
import { DelitoDisponible } from './models/apelacion-aux.model';
import { ModalService } from '../../../shared/components/modal-custom/services/modal.service';

@Component({
  selector: 'app-captura-apelacion',
  standalone: true,
  providers: [CatalogosFacade, BusquedaFacade, GuardarFacade],
  imports: [
    CommonModule, ReactiveFormsModule,
    ActionSidebarComponent,
    PanelIdentificacionComponent, PanelPartesComponent, PanelRelacionesComponent,
    ModalAnexosComponent,
  ],
  templateUrl: './captura-apelaciones.component.html',
})
export class CapturaApelacionesComponent implements OnInit, OnDestroy {

  // ── Facades
  cat = inject(CatalogosFacade);
  bus = inject(BusquedaFacade);
  grd = inject(GuardarFacade);
  private router = inject(Router);
  private fb  = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private modal = inject(ModalService);

  // ── UI
  identificacionOpen = true;
  partesOpen         = true;
  datosGeneralesOpen = true;
  relacionesFinalesOpen = false;
  activeTab: 'partes' | 'relaciones' = 'partes';
  fechaActual = new Date();

  // ── Modales
  mostrarModalAnexos = signal(false);
  folioGuardado      = signal('');
  salaGuardada       = signal('');

  // ── Formularios
  form!:      FormGroup;
  parteForm!: FormGroup;

  // ── Estado de partes / relaciones
  partes:     Parte[]            = [];
  relaciones: RelacionBusqueda[] = [];
  delitosDisponibles: DelitoDisponible[] = [];
  procesadoSeleccionado: Parte | null = null;
  ofendidoSeleccionado:  Parte | null = null;
  busquedaDelitoTexto = new FormControl('');
  mostrarFormParte    = false;

  // Señal para el spinner al momento de guardar
  guardando = signal(false);

// ── Sidebar
  get sidebarActions(): SidebarAction[] {
    const isSaving = this.guardando();
    return [
      { id: 'nuevo',   label: 'Nuevo',   icon: 'nuevo',   primary: true, disabled: isSaving },
      { id: 'guardar', label: 'Guardar', icon: 'guardar', loading: isSaving, disabled: isSaving },
      { id: 'buscar',  label: 'Buscar',  icon: 'buscar',  disabled: isSaving },
      { id: 'anexo',   label: 'Anexo',   icon: 'anexo',   disabled: isSaving },
    ];
  }

  private intervalId?: ReturnType<typeof setInterval>;

  // Getters
  get esIndigena(): boolean {
    const id = this.form.get('materiaId')?.value;
    const desc = this.cat.materias.find(m => m.id === id)?.descripcion ?? '';
    return desc.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === 'indigena'
  }
  get procesados()       { return this.partes.filter(p => p.roleOrigin === 'procesado'); }
  get ofendidos()        { return this.partes.filter(p => p.roleOrigin === 'ofendido');  }
  get delitosFiltrados() {
    const q = this.busquedaDelitoTexto.value?.trim().toLowerCase() ?? '';
    return q ? this.delitosDisponibles.filter(d => d.delito.toLowerCase().includes(q)) : this.delitosDisponibles;
  }

  // Lifecycle
  ngOnInit(): void {
    this.buildForm();
    this.wireCallbacks();
    this.cat.cargar(this.form, 'penal');
    this.intervalId = setInterval(() => {
    this.fechaActual = new Date();
    this.cdr.detectChanges();
    }, 1000);
    this.form.get('materiaId')!.valueChanges.subscribe(() =>
      this.bus.actualizarValidadoresPorMateria(this.form, this.esIndigena)
    );
  }

  ngOnDestroy(): void { clearInterval(this.intervalId); }

  // Callbacks de facades
private wireCallbacks(): void {
  this.cat.onDelitosLisros = (d) => { this.delitosDisponibles = d; this.cdr.detectChanges(); };
  this.cat.onError = (m) => this.modal.error('Error', m);

  this.bus.onExito = ({ partes, relaciones, delitosDisponibles }) => {
    this.partes = partes; this.relaciones = relaciones; this.delitosDisponibles = delitosDisponibles;
    this.cdr.detectChanges();
  };
  this.bus.onError = (m) => this.modal.error('Error', m);
  this.bus.onNuevo = () => this.limpiarEstadoCaptura();

  this.grd.onExito    = () =>{
    this.guardando.set(false);
    this.mostrarModalAnexos.set(true)
    const materiaActual = this.esIndigena ? 'indigena' : 'penal';
    this.actualizarFolioTentativo(materiaActual);
  };

  this.grd.onTerminar = () => {
    this.guardando.set(false);
    this.limpiarEstadoCaptura();
    this.actualizarFolioTentativo('penal');
  };

  this.grd.onError    = (m) => {
    this.guardando.set(false);
    this.modal.error('Error', m);
  };
}

  // Formulario
  private buildForm(): void {
    this.form = this.fb.group({
      busquedaRapida:      [''],
      materiaId:           [null, Validators.required],
      magistradoId:        [null, Validators.required],
      apelacionId:         [null], tipoApelacionId:     [null], tipoEscritoId:       [null],
      juzgadoId:           [null], municipioId:         [null], localidadId:         [null],
      etniaId:             [null], expedienteCausa:     [null], expedienteAcumulado: [null],
      fechaAuto:           [null],   folioOficio:         [null],   fojas:               [null],
      otroEtnia:           [null],
      asunto:              [null],   lugarHechos:         [null],
      esReposicion:        [false], observaciones:      [null],
      folioTentativo:      [{ value: '', disabled: true }],
    });
    this.parteForm = this.fb.group({
      nombre: ['', Validators.required], sexo: ['', Validators.required],
      tipoParte: ['', Validators.required], direccion: [''], esMenor: [false],
    });
  }

// Acciones sidebar
  handleAction(id: string): void {
    const actions: Record<string, () => void> = {
      nuevo:   () => { this.bus.resetNuevo(this.form); this.form.reset(); },
      guardar: () => {
        this.guardando.set(true);
        this.grd.guardar(
          this.form, this.relaciones, this.partes,
          this.cat.sexos, this.cat.tiposPartes, this.folioGuardado, this.salaGuardada,
          () => {
            this.guardando.set(false);
            this.modal.info('Advertencia', 'Por favor, complete los campos obligatorios.');
          }
        );
      },
      buscar: () => this.router.navigate(['capturaApelacion/busquedaApelacion']),
    };
    actions[id]?.();
  }

  // ── Partes
  agregarParte(): void {
    this.parteForm.reset({ nombre: '', sexo: '', tipoParte: '', direccion: '', esMenor: false });
    this.mostrarFormParte = true;
  }
  guardarParte(): void {
    if (this.parteForm.invalid) return;
    this.partes = [...this.partes, buildNuevaParte(this.parteForm.value)];
    this.mostrarFormParte = false;
    this.cdr.detectChanges();
  }

  // ── Relaciones
  agregarRelacionDesdePanel(): void {
    if (!this.procesadoSeleccionado || !this.ofendidoSeleccionado) return;
    this.relaciones = [...this.relaciones, buildNuevaRelacion(
      this.procesadoSeleccionado, this.ofendidoSeleccionado,
      this.delitosDisponibles.filter(d => d.seleccionado)
    )];
    this.delitosDisponibles    = this.delitosDisponibles.map(d => ({ ...d, seleccionado: false }));
    this.procesadoSeleccionado = null; this.ofendidoSeleccionado = null;
    this.relacionesFinalesOpen = true;
    this.cdr.detectChanges();
  }

  eliminarDelitoDeRelacion(e: { relId: string; delitoId: number | string }): void {
    this.relaciones = this.relaciones
      .map(r => r.id === e.relId ? { ...r, delitosRelacion: r.delitosRelacion.filter(d => d.id !== Number(e.delitoId)) } : r)
      .filter(r => r.delitosRelacion.length > 0);
  }

  toggleDelito(d: DelitoDisponible): void {
    this.delitosDisponibles = this.delitosDisponibles.map(x => x.id === d.id ? { ...x, seleccionado: !x.seleccionado } : x);
  }

  seleccionarProcesado(p: Parte): void { this.procesadoSeleccionado = this.procesadoSeleccionado?.id === p.id ? null : p; this.cdr.detectChanges(); }
  seleccionarOfendido(p: Parte):  void { this.ofendidoSeleccionado  = this.ofendidoSeleccionado?.id  === p.id ? null : p; this.cdr.detectChanges(); }

  // Limpieza de estado post-guardado
  private limpiarEstadoCaptura(): void {
    this.partes                = [];
    this.relaciones            = [];
    this.procesadoSeleccionado = null;
    this.ofendidoSeleccionado  = null;
    this.delitosDisponibles    = this.delitosDisponibles.map(d => ({ ...d, seleccionado: false }));
    this.busquedaDelitoTexto.setValue('');
    this.cdr.detectChanges();
  }
  private actualizarFolioTentativo(materia?: string): void {
  const materiaStr = materia || (this.esIndigena ? 'indigena' : 'penal');
  this.cat.cargar(this.form, materiaStr);
  }
}

import { ActionSidebarComponent, SidebarAction } from "../../shared/components/Action-siderbar/action-siderbar.component";
import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainHeaderComponent } from "../../shared/components/header/header.component";
import { CapturaApelacionCatalogos, CatalogoItem, ApelacionBusqueda, RelacionBusqueda, ParteBusqueda, DelitoBusqueda, Parte} from '../../core/models';
import { ApelacionService } from "../../core/services/apelaciones.service";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Router } from '@angular/router';
import { ApelacionContextService } from "./service/apelacion-context.service";


@Component({
  selector: 'app-captura-apelacion',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ActionSidebarComponent, MainHeaderComponent],
  templateUrl: './captura-apelaciones.component.html',
})
export class CapturaApelacionesComponent implements OnInit {

  private fb              = inject(FormBuilder);
  private apelacionService = inject(ApelacionService);
  private busquedaSvc     = inject(ApelacionService);
  private router = inject(Router);
  private contextoService = inject(ApelacionContextService);

  // ── Estado de paneles ──────────────────────────────────────
  identificacionOpen  = true;
  partesOpen          = true;
  datosGeneralesOpen  = true;
  relacionesOpen      = false;
  activeTab: 'partes' | 'relaciones' = 'partes';
  relacionesFinalesOpen = false;
  delitosDisponibles: { id: number; delito: string; seleccionado: boolean }[] = [];
  procesadoSeleccionado: Parte | null = null;
  ofendidoSeleccionado:  Parte | null = null;
  busquedaDelitoTexto = new FormControl('');
  private cdr = inject(ChangeDetectorRef);
  folioGuardado = signal<string>('');

  // ── Catálogos ──────────────────────────────────────────────

  materias:         CatalogoItem[] = [];
  apelaciones:      CatalogoItem[] = [];
  tiposApelaciones: CatalogoItem[] = [];
  tiposEscritos:    CatalogoItem[] = [];
  juzgados:         CatalogoItem[] = [];
  magistrados:      CatalogoItem[] = [];
  municipios:       CatalogoItem[] = [];
  localidades:      CatalogoItem[] = [];
  etnias:           CatalogoItem[] = [];
  delitos:          CatalogoItem[] = [];
  folioTentativo:   string = '';
  tiposPartes:      CatalogoItem [] = [];
  sexos:            CatalogoItem [] = [];

  // ── Estado UI ──────────────────────────────────────────────
  cargando = false;
  error: string | null = null;
  timeoutMsg = false;
  fechaActual: Date = new Date();
  private anioActual  = new Date().getFullYear();
  tipoModal: 'success' | 'error' = 'error';
  mostrarModalAnexos = signal(false);
    // ── Estado búsqueda ────────────────────────────────────────
  buscando       = false;
  errorBusqueda: string | null = null;
  busquedaExitosa = false;
  modalVisible = false;
  modalMensaje = '';
  guardando     = false;
  errorGuardado: string | null = null;
  // ── Formulario ─────────────────────────────────────────────
  form!: FormGroup;
  partes: Parte[] = [];
  relaciones: RelacionBusqueda[] = [];
  intervalId: any;
  parteForm!: FormGroup;
  relacionForm!: FormGroup;
  mostrarFormParte = false;
  mostrarFormRelacion = false;
  delitosTemp: { id: string; delito: string }[] = [];
  // ── Sidebar ────────────────────────────────────────────────
  sidebarActions: SidebarAction[] = [
    { id: 'nuevo',      label: 'Nuevo',      icon: 'nuevo',      primary: true },
    { id: 'guardar',    label: 'Guardar',    icon: 'guardar' },
    { id: 'buscar',     label: 'Buscar',     icon: 'buscar' },
    { id: 'anexo',      label: 'Anexo',      icon: 'anexo' },
  ];

  /** Deshabilita todos los botones del sidebar excepto "Nuevo" */
  private bloquearSidebar(): void {
    this.sidebarActions = this.sidebarActions.map(a =>
      a.id === 'nuevo' ? a : { ...a, disabled: true }
    );
  }

  /** Rehabilita todos los botones del sidebar */
  private habilitarSidebar(): void {
    this.sidebarActions = this.sidebarActions.map(a => ({ ...a, disabled: false }));
  }

  ngOnInit(): void {
    this.buildForm();
    this.cargarCatalogos();
    setInterval(() => {
    this.fechaActual = new Date();
  }, 1000);

  this.parteForm = this.fb.group({
  nombre: ['', Validators.required],
  sexo: ['', Validators.required],
  tipoParte: ['', Validators.required],
  direccion: [''],
  esMenor: [false]
});

this.relacionForm = this.fb.group({
  procesadoId: [null, Validators.required],
  ofendidoId: [null, Validators.required],
  delitos: ['']
});

  // ── Validadores dinámicos según materia ───────────────────
  this.form.get('materiaId')!.valueChanges.subscribe(() => {
    this.actualizarValidadoresPorMateria();
  });
}

  ngOnDestroy(): void {
  clearInterval(this.intervalId);
}

  private buildForm(): void {
    this.form = this.fb.group({
      busquedaRapida:      [''],
      folioOficialia:      [''],
      materiaId:           [null, Validators.required],
      apelacionId:         [null],
      tipoApelacionId:     [null],
      fechaAuto:           [''],
      expedienteCausa:     [''],
      tipoEscritoId:       [null],
      folioOficio:         [''],
      juzgadoId:           [null],
      magistradoId:        [null, Validators.required],
      expedienteAcumulado: [''],
      fojas:               [null],
      municipioId:         [null],
      localidadId:         [null],
      etniaId:             [null],
      asunto:              [''],
      lugarHechos:         [''],
      esReposicion:        [false],
      observaciones:       [''],
      folioTentativo:      [{ value: this.folioTentativo, disabled: true }],
    });

      this.parteForm = this.fb.group({
      nombre: ['', Validators.required],
      sexo: ['', Validators.required],
      tipoParte: ['', Validators.required], // Si en el HTML usas "tipoParte", aquí debe decir "tipoParte"
      direccion: [''],
      esMenor: [false]
});
  }

  /** Activa/desactiva los validators según si la materia es Indígena */
  private actualizarValidadoresPorMateria(): void {
    const indigena = this.esIndigena;

    // Campos exclusivos de NO-indígena
    const camposNormales = ['apelacionId', 'juzgadoId'];
    // Campos exclusivos de indígena
    const camposIndigena = ['municipioId', 'localidadId', 'etniaId', 'asunto', 'lugarHechos'];

    camposNormales.forEach(campo => {
      const ctrl = this.form.get(campo)!;
      if (indigena) {
        ctrl.clearValidators();
        ctrl.setValue(null);
      } else {
        ctrl.setValidators(Validators.required);
      }
      ctrl.updateValueAndValidity({ emitEvent: false });
    });

    camposIndigena.forEach(campo => {
      const ctrl = this.form.get(campo)!;
      if (indigena) {
        ctrl.setValidators(Validators.required);
      } else {
        ctrl.clearValidators();
        ctrl.setValue(campo === 'asunto' || campo === 'lugarHechos' ? '' : null);
      }
      ctrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  /** Deshabilita los campos rellenados por búsqueda rápida para que no sean editables */
  private bloquearCamposBusqueda(): void {
    const campos = [
      'materiaId', 'apelacionId', 'tipoApelacionId', 'tipoEscritoId',
      'juzgadoId', 'municipioId', 'localidadId', 'magistradoId', 'etniaId',
      'expedienteCausa', 'fechaAuto', 'fojas', 'expedienteAcumulado',
      'folioOficio', 'esReposicion', 'observaciones', 'lugarHechos', 'asunto',
    ];
    campos.forEach(c => this.form.get(c)?.disable({ emitEvent: false }));
    this.bloquearSidebar();
  }

  /** Rehabilita todos los campos al crear un registro nuevo */
  private habilitarCamposBusqueda(): void {
    const campos = [
      'materiaId', 'apelacionId', 'tipoApelacionId', 'tipoEscritoId',
      'juzgadoId', 'municipioId', 'localidadId', 'magistradoId', 'etniaId',
      'expedienteCausa', 'fechaAuto', 'fojas', 'expedienteAcumulado',
      'folioOficio', 'esReposicion', 'observaciones', 'lugarHechos', 'asunto',
    ];
    campos.forEach(c => this.form.get(c)?.enable({ emitEvent: false }));
    this.habilitarSidebar();
  }

cargarCatalogos(): void {
  this.cargando   = true;
  this.error      = null;
  this.timeoutMsg = false;
  this.setControlesDisabled(true);

  // Aviso si tarda más de 5s (Render despertando)
  const timer = setTimeout(() => {
    if (this.cargando) {
      this.timeoutMsg = true;
      console.warn('El servidor está tardando en responder (Render en arranque)...');
    }
  }, 5000);

  this.apelacionService.getCatalogoCaptura().subscribe({
    next: (data: CapturaApelacionCatalogos) => {
      clearTimeout(timer);
      console.log('Catálogos cargados en el componente:', data);

      this.materias         = data.materias;
      this.apelaciones      = data.apelaciones;
      this.tiposApelaciones = data.tiposApelaciones;
      this.tiposEscritos    = data.tiposEscritos;
      this.juzgados         = data.juzgados;
      this.magistrados      = data.magistrados;
      this.municipios       = data.municipios;
      this.localidades      = data.localidades;
      this.etnias           = data.etnias ?? [];
      this.delitos          = data.delitos;
      this.folioTentativo   =data.folioTentativo;
      this.tiposPartes = data.tiposPartes || [];
      this.sexos = data.sexos || [];
      this.cargarDelitos();

      this.cargando   = false;
      this.timeoutMsg = false;
      this.setControlesDisabled(false);
    },
    error: (err) => {
      clearTimeout(timer);
      console.error('❌ Error en cargarCatalogos:', err);

      this.error      = 'No se pudo conectar con el servidor. Reintentando...';
      this.cargando   = false;
      this.timeoutMsg = false;

      // ← Reintento automático a los 5 segundos
      console.warn('Reintentando en 5 segundos...');
      setTimeout(() => {
        this.apelacionService.invalidarCatalogos(); // limpia caché fallida
        this.cargarCatalogos();
      }, 5000);
    }
  });
}

private parseMenor(menorEdad: any): boolean {
  if (typeof menorEdad === 'boolean') {
    return menorEdad; // Si ya es boolean, devuélvelo tal cual
  }
  if (typeof menorEdad === 'string') {
    return menorEdad.trim() === '1'; // Si es string, haz tu lógica original
  }
  return false; // Por defecto
}

/** Normaliza sexo para mostrar en UI */
private formatSexo(sexo: string): string {
  if (!sexo) return '';
  const mapa: Record<string, string> = {
    HOMBRE: 'Masculino',
    MUJER:  'Femenino',
    OTRO:   'Otro',
  };
  return mapa[sexo.toUpperCase()] ?? sexo;
}

private setControlesDisabled(disabled: boolean): void {
  const controles = [
    'materiaId',
    'apelacionId',
    'tipoApelacionId',
    'tipoEscritoId',
    'juzgadoId',
    'municipioId',
    'localidadId'
  ];

  controles.forEach(campo => {
    const control = this.form.get(campo);
    if (!control) return;

    disabled ? control.disable() : control.enable();
  });
}

// Formateo de fecha ISO → YYYY-MM-DD para inputs tipo date
private toDateInput(isoString: string | null): string {
  if (!isoString) return '';
  return isoString.split('T')[0];
}

  // ── Búsqueda rápida ────────────────────────────────────────
buscarApelacion(): void {
  const folio = this.form.get('busquedaRapida')?.value?.trim();

  if (!folio) {
    this.mostrarModal('Ingrese un folio para buscar.', 'error');
    return;
  }

  this.buscando = true;
  this.errorBusqueda = null;
  this.busquedaExitosa = false;

  this.busquedaSvc.buscarPorFolio(folio).subscribe({
    next: (data: ApelacionBusqueda) => {
      this.buscando = false;

      // i por alguna razón viene vacío o null
      if (!data) {
        this.busquedaExitosa = false;
        const folioIngresado = folio;
        this.form.reset();
        this.form.patchValue({ busquedaRapida: folioIngresado });

        return;
      }
      this.busquedaExitosa = true;
      this.cargarDelitos();
      this.cargarEnFormulario(data);

    },
    error: () => {
      this.buscando = false;
      this.busquedaExitosa = false;

      // Mostrar modal en lugar de texto
     this.mostrarModal(
  `No se encontró ninguna apelación con el folio "${folio}".<br>
   Por favor, verifique el folio e intente de nuevo.`, 'error'
);


      // reset del form pero conservando folio
      const folioIngresado = folio;
      this.form.reset();
      this.form.patchValue({ busquedaRapida: folioIngresado });
    }
  });
}

mostrarModal(mensaje: string, tipo: 'success' | 'error' = 'error'): void {
  this.modalMensaje = mensaje;
  this.modalVisible = true;
  this.tipoModal = tipo;
  this.cdr.detectChanges();
}

cerrarModal(): void {
  this.modalVisible = false;
}

  // Mapea texto de la API → id del catálogo y llena el form
// 1. CORRECCIÓN EN EL MAPEADO DE LA BÚSQUEDA RÁPIDA
private cargarEnFormulario(d: ApelacionBusqueda): void {
  console.log('DATOS DE LA BÚSQUEDA:', d);
  this.form.patchValue({
    folioTentativo:   d.folioTentativo,
    expedienteCausa:  d.expedienteCausa,
    fojas:            d.fojas,
    esReposicion:     d.esReposicion,
    fechaAuto:        this.toDateInput(d.fechaAuto),
    observaciones:    d.observaciones   ?? '',
    materiaId:        d.materia?.id     ?? null,
    tipoApelacionId:  d.tipoApelacion?.id ?? null,
    tipoEscritoId:    d.tipoEscrito?.id  ?? null,
    juzgadoId:        d.juzgadoOrigen?.id ?? null,
    magistradoId:     d.magistrado?.id ?? null,
    etniaId:          d.etnia?.id   ?? null,
    lugarHechos:      d.lugarHechos   ?? null,
    asunto:           d.asunto        ?? null,
    municipioId:      d.municipio?.id   ?? null,
    localidadId:      d.localidad?.id   ?? null,
  });

  this.bloquearCamposBusqueda();

  const partesMap = new Map<number, Parte>();

  // Procesar relaciones para extraer partes (Procesados y Ofendidos)
  d.relaciones?.forEach(rel => {
    if (rel.procesado && !partesMap.has(Number(rel.procesado.id))) {
      partesMap.set(Number(rel.procesado.id), {
        id:           Number(rel.procesado.id),
        nombre:       rel.procesado.nombre,
        sexo:         this.formatSexo(rel.procesado.sexo),
        tipoParte:    this.formatTipoParte(rel.procesado.tipoParte),
        direccion:    rel.procesado.direccion === 'N/A' ? '' : rel.procesado.direccion,
        menorEdad:    this.parseMenor(rel.procesado.menorEdad),
        seleccionada: false,
      });
    }

    if (rel.ofendido && !partesMap.has(Number(rel.ofendido.id))) {
      partesMap.set(Number(rel.ofendido.id), {
        id:           Number(rel.ofendido.id),
        nombre:       rel.ofendido.nombre,
        sexo:         this.formatSexo(rel.ofendido.sexo),
        tipoParte:    this.formatTipoParte(rel.ofendido.tipoParte),
        direccion:    rel.ofendido.direccion === 'N/A' ? '' : rel.ofendido.direccion,
        menorEdad:    this.parseMenor(rel.ofendido.menorEdad),
        seleccionada: false,
      });
    }
  });

  this.partes = Array.from(partesMap.values());

  // CORRECCIÓN: Mapear delitos usando la descripción que ya viene en el JSON
  this.relaciones = (d.relaciones ?? []).map(rel => ({
    ...rel,
    id: rel.id.toString(),
    delitosRelacion: rel.delitosRelacion.map(dr => {
      // Intentar buscar en catálogo local, pero priorizar lo que viene del JSON
      const encontradoLocal = this.delitos.find(x => Number(x.id) === Number(dr.delito?.id || dr.id));

      return {
        id: Number(dr.id),
        delito: {
          id: Number(dr.delito?.id || dr.id),
          descripcion: dr.delito?.descripcion || encontradoLocal?.descripcion || 'Delito no encontrado'
        }
      } as DelitoBusqueda;
    })
  }));

  // Sincronizar selección en el buscador lateral
  const idsDelitosRelacion = new Set<number>();
  this.relaciones.forEach(rel => {
    rel.delitosRelacion.forEach(dr => idsDelitosRelacion.add(dr.delito.id));
  });

  this.delitosDisponibles = this.delitosDisponibles.map(del => ({
    ...del,
    seleccionado: idsDelitosRelacion.has(del.id)
  }));

  this.cdr.detectChanges();
}

// 2. CORRECCIÓN EN EL FILTRADO DEL BUSCADOR
relacionesFiltradas(): RelacionBusqueda[] {
  const q = this.busquedaDelitoTexto.value?.trim().toLowerCase();
  if (!q) return this.relaciones;

  return this.relaciones.filter(rel =>
    rel.delitosRelacion.some(d =>
      // Acceder a la propiedad descripción del objeto anidado
      d.delito?.descripcion?.toLowerCase().includes(q)
    )
  );
}
// Formatea "PROCESADO" → "Procesado", "OFENDIDO" → "Ofendido"
formatTipoParte(tipo: string): string {
  if (!tipo) return '';
  return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
}

  // ── Toggles ────────────────────────────────────────────────
  toggleAsunto()         { this.identificacionOpen = !this.identificacionOpen; }
  togglePartes()         { this.partesOpen = !this.partesOpen; }
  toggleDatosGenerales() { this.datosGeneralesOpen = !this.datosGeneralesOpen; }
  toggleRelaciones()     { this.relacionesOpen = !this.relacionesOpen; }
  toggleRelacionesFinales() { this.relacionesFinalesOpen = !this.relacionesFinalesOpen; }

  // ── Acciones del sidebar ───────────────────────────────────
// handleAction — reemplaza el case 'nuevo'
handleAction(id: string): void {
  switch (id) {
    case 'nuevo':
      const folio = this.form.get('folioOficialia')?.value;
      this.habilitarCamposBusqueda();
      this.form.reset();
      this.partes    = [];
      this.relaciones = [];
      this.procesadoSeleccionado = null;
      this.ofendidoSeleccionado  = null;
      this.busquedaExitosa = false;
      // Desmarcar todos los delitos del buscador y limpiar texto de búsqueda
      this.delitosDisponibles = this.delitosDisponibles.map(d => ({ ...d, seleccionado: false }));
      this.busquedaDelitoTexto.setValue('');
      // Restaura el folio ya incrementado (disabled no se resetea con reset())
      // pero por si acaso:
      this.form.patchValue({ folioOficialia: () => {} });
      break;
    case 'guardar':    this.onGuardar(); break;
    case 'buscar':     this.router.navigate(['/busquedaApelacion']); break;
    case 'anexo':      this.router.navigate(['/anexos']); break;
    case 'certificar': break;
  }
}

toggleMenor(parte: Parte): void {
  parte.menorEdad = !parte.menorEdad;
}

seleccionarParte(parte: Parte): void {
  parte.seleccionada = !parte.seleccionada;
}

agregarParte(): void {
  // aquí abrirás el formulario o modal para agregar
  console.log('Agregar parte');
  this.mostrarFormParte = true;
}

private onGuardar(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.mostrarModal('Por favor, complete los campos obligatorios antes de guardar.', 'error');
    return;
  }
  const payload = this.buildPayload();
  // Opcional: verlo bonito
/*   console.log('JSON formateado:', JSON.stringify(payload, null, 2));
  console.log('Form raw:', this.form.getRawValue()); */
    this.apelacionService.guardarApelacion(payload).subscribe({
    next: (res: any) => {
    this.guardando = false;
    if(res.status==='success') {
    const fol = res.data.folioOficialia;
    this.folioGuardado.set(fol);
    this.apelacionService.invalidarCatalogos();
    this.contextoService.setContexto(res.data.id, fol);
    this.mostrarModalAnexos.set(true);
    }
    this.apelacionService.getFolioTentativo().subscribe({
      next: (folio) => {
        this.folioTentativo = folio;
        this.form.patchValue({ folioTentativo: folio });
      },
      error: (err) => {
        console.error('Error al obtener nuevo folio tentativo:', err);
      }
    });
    },
    error: (err) => {
      this.guardando = false;
      console.error('Error al guardar - Status:', err.status);
      console.error('Mensaje:', err.error);
      const msg = err?.error?.message ?? 'Error al guardar la apelación. Intente de nuevo.';
      this.mostrarModal(msg, 'error');
    }
  });
}

  private buildPayload(): object {
  const raw = this.form.getRawValue();

  // Mapeo de sexo UI → id numérico para la API
  const sexoId: Record<string, number> = {
    Masculino: 1,
    Femenino:  2,
    Otro:      3,
  };

  // Busca la parte en `this.partes` para obtener esMenor y direccion actualizados
  const resolverParte = (parteApi: ParteBusqueda) => {
    const parteLocal = this.partes.find(p => p.id === Number(parteApi.id));
    return {
      nombre:     parteApi.nombre,
      idTipoParte: tipoParteId[parteLocal?.tipoParte ?? ''] ?? null,
      idSexo:     sexoId[parteLocal?.sexo ?? ''] ?? null,
      direccion:  parteLocal?.direccion || null,
      menorEdad:    parteLocal?.menorEdad   ?? false,
      activo:     true,
    };
  };
  const tipoParteId: Record<string, number> = {
  Ofendido: 1,
  Procesado: 2,
};
  const relaciones = this.relaciones.map(rel => ({
    ofendido:         rel.ofendido  ? resolverParte(rel.ofendido)  : null,
    procesado:        rel.procesado ? resolverParte(rel.procesado) : null,
    delitoRelaciones: rel.delitosRelacion.map(d => ({ idDelito: Number(d.id) })),
  }));

  return {
  folioOficialia: this.folioTentativo || 2113,
  idMateria: raw.materiaId,
  idNomenclatura: 2,
  idTipoApelacion: raw.tipoApelacionId ?? null,
  idTipoEscrito: raw.tipoEscritoId ?? null,
  idJuzgado: raw.juzgadoId,
  idMunicipio: raw.municipioId ?? null,
  idLocalidad: raw.localidadId ?? null,
  idEtnia: raw.etniaId ?? null,
  fechaAuto: new Date().toISOString(),
  fechaHoraRecepcion: new Date().toISOString(),
  expedienteCausa: raw.expedienteCausa || null,
  expedienteAcumulado: raw.expedienteAcumulado || null,
  folioOficio: raw.folioOficio || null,
  fojas: raw.fojas ?? null,
  Observaciones : raw.observaciones || null,
  fechaHoraIngresoJuz: new Date().toISOString(),
  idMagistradoAsignado: raw.magistradoId,
  asunto: raw.asunto || null,
  lugarHechos:  raw.lugarHechos || null,
  esReposicion: raw.esReposicion ?? false,
  relaciones
  };
}

// guardarParte — reset con valores explícitos para no romper placeholders
guardarParte(): void {
  if (this.parteForm.invalid) return;

  const nueva: Parte = {
    id: Date.now(),
    ...this.parteForm.value,
    seleccionada: false
  };

  this.partes = [...this.partes, nueva];  // ← nuevo array para detección
  this.cdr.detectChanges();

  // Reset con valores vacíos explícitos
  this.parteForm.setValue({
    nombre:    '',
    sexo:      '',
    tipoParte: '',
    direccion: '',
    esMenor:   false
  });
  this.mostrarFormParte = false;
  console.log('Partes:', this.partes);
}
cancelarRelacion(): void {
  this.mostrarFormRelacion = false;
  this.relacionForm.reset();
  this.delitosTemp = [];   // ← limpiar delitos al cancelar
}


guardarRelacion(): void {
  if (this.relacionForm.invalid) return;

  const { procesadoId, ofendidoId } = this.relacionForm.value;

  const procesado = this.partes.find(p => p.id == procesadoId);
  const ofendido  = this.partes.find(p => p.id == ofendidoId);

  const nuevaRelacion: RelacionBusqueda = {
    id: Date.now().toString(),
    // Mapeamos el objeto completo para cumplir con la interfaz ParteBusqueda
    procesado: procesado ? {
      id: Number(procesado.id),
      nombre: procesado.nombre,
      direccion: procesado.direccion,
      menorEdad: procesado.menorEdad,
      sexo: procesado.sexo,
      tipoParte: procesado.tipoParte
    } : null,
    ofendido: ofendido ? {
      id: Number(ofendido.id),
      nombre: ofendido.nombre,
      direccion: ofendido.direccion,
      menorEdad: ofendido.menorEdad,
      sexo: ofendido.sexo,
      tipoParte: ofendido.tipoParte
    } : null,
   delitosRelacion: this.delitosTemp.map(d => ({
    id: Number(d.id),
    delito: {
      id: Number(d.id),
      descripcion: (d as any).delito // El string que antes llamabas 'delito' ahora va en 'descripcion'
    }
  }))
  };

  this.relaciones = [...this.relaciones, nuevaRelacion];

  this.relacionForm.reset();
  this.delitosTemp = [];
  this.mostrarFormRelacion = false;
}

agregarDelito(event: Event): void {
  event.preventDefault();

  const value = this.relacionForm.get('delitos')?.value?.trim();

  if (!value) return;

  this.delitosTemp.push({
    id: Date.now().toString(),
    delito: value
  });

  this.relacionForm.get('delitos')?.setValue('');
}

eliminarDelitoDeRelacion(relId: string, delitoId: number | string): void {
  this.relaciones = this.relaciones
    .map(rel => {
      if (rel.id === relId) {
        return {
          ...rel,
          // Convertimos delitoId a Number para asegurar la comparación con d.id (que es number)
          delitosRelacion: rel.delitosRelacion.filter(d => d.id !== Number(delitoId))
        };
      }
      return rel;
    })
    // Si la relación se queda sin delitos, la eliminamos de la lista
    .filter(rel => rel.delitosRelacion.length > 0);
}

cargarDelitos(): void {
  // Si tienes endpoint de delitos, cárgalos aquí
  // Por ahora los inicializas vacíos o desde el catálogo
  this.delitosDisponibles = (this.delitos ?? []).map(d => ({
    id:            d.id,
    delito:  d.descripcion,
    seleccionado:  false,
  }));
}

get delitosFiltrados() {
  const q = this.busquedaDelitoTexto.value?.trim().toLowerCase() ?? '';
  if (!q) return this.delitosDisponibles;
  return this.delitosDisponibles.filter(d =>
    d.delito.toLowerCase().includes(q)
  );
}
get procesados(): Parte[] { return this.partes.filter(p => p.tipoParte === 'Procesado'); }
get ofendidos():  Parte[] { return this.partes.filter(p => p.tipoParte === 'Ofendido'); }

/** Retorna true cuando la materia seleccionada es "Indígena" (case-insensitive) */
get esIndigena(): boolean {
  const id = this.form.get('materiaId')?.value;
  if (!id) return false;
  const materia = this.materias.find(m => m.id === id);
  return materia?.descripcion?.trim().toLowerCase() === 'indígena';
}
// marcarTodos — usa detectChanges
marcarTodosProcesados(): void {
  const lista = this.procesados;
  this.procesadoSeleccionado = lista.length ? lista[0] : null;
}

marcarTodosOfendidos(): void {
  const lista = this.ofendidos;
  this.ofendidoSeleccionado = lista.length ? lista[0] : null;
}

// seleccionarProcesado/Ofendido — detectChanges
seleccionarProcesado(parte: Parte): void {
  this.procesadoSeleccionado = this.procesadoSeleccionado?.id === parte.id ? null : parte;
  this.cdr.detectChanges();
}

seleccionarOfendido(parte: Parte): void {
  this.ofendidoSeleccionado = this.ofendidoSeleccionado?.id === parte.id ? null : parte;
  this.cdr.detectChanges();
}
// agregarRelacionDesdePanel — nuevo array para que Angular detecte
agregarRelacionDesdePanel(): void {
  if (!this.procesadoSeleccionado || !this.ofendidoSeleccionado) return;

  const delitosSeleccionados: DelitoBusqueda[] = this.delitosDisponibles
    .filter(d => d.seleccionado)
    .map(d => ({
      id: Number(d.id),
      delito: {
        id: Number(d.id),
        descripcion: d.delito // Asumiendo que d.delito es el string de la descripción
      }
    }));

  const nuevaRelacion: RelacionBusqueda = {
    id: Date.now().toString(), // El ID de la relación sí es string en tu interfaz
    procesado: {
      id: Number(this.procesadoSeleccionado.id),
      nombre: this.procesadoSeleccionado.nombre,
      sexo: this.procesadoSeleccionado.sexo,
      tipoParte: this.procesadoSeleccionado.tipoParte,
      direccion: this.procesadoSeleccionado.direccion,
      menorEdad: this.procesadoSeleccionado.menorEdad,
    },
    ofendido: {
      id: Number(this.ofendidoSeleccionado.id),
      nombre: this.ofendidoSeleccionado.nombre,
      sexo: this.ofendidoSeleccionado.sexo,
      tipoParte: this.ofendidoSeleccionado.tipoParte,
      direccion: this.ofendidoSeleccionado.direccion,
      menorEdad: this.ofendidoSeleccionado.menorEdad,
    },
    delitosRelacion: delitosSeleccionados,
  };

  this.relaciones = [...this.relaciones, nuevaRelacion];

  // Limpieza de estado
  this.delitosDisponibles = this.delitosDisponibles.map(d => ({ ...d, seleccionado: false }));
  this.procesadoSeleccionado = null;
  this.ofendidoSeleccionado = null;
  this.relacionesFinalesOpen = true;
  this.cdr.detectChanges();
}

eliminarRelacion(id: string): void {
  this.relaciones = this.relaciones.filter(r => r.id !== id);
}

private actualizarFolioTentativo(): void {
  this.apelacionService.getFolioTentativo().subscribe({
    next: (folio: string) => {
      this.folioTentativo = folio;  // ← esto actualiza el [value] en el HTML
      this.cdr.detectChanges();     // ← fuerza que Angular re-renderice
    },
    error: (err) => {
      console.error('❌ No se pudo actualizar el folio tentativo:', err);
    }
  });
}

continuarConAnexos() {
    this.mostrarModalAnexos.set(false); // Cerramos modal por limpieza
    this.router.navigate(['/anexos']);  // Ejecutamos el flujo anterior
  }

  terminarSinAnexos() {
    this.mostrarModalAnexos.set(false);
    this.contextoService.limpiarContexto(); // Limpiamos memoria
    this.form.reset
    // this.router.navigate(['/lista-apelaciones']);
    console.log('Registro finalizado sin anexos.');
  }
}

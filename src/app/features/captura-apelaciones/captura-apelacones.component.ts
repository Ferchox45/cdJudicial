import { ActionSidebarComponent, SidebarAction } from "../../shared/components/Action-siderbar/action-siderbar.component";
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainHeaderComponent } from "../../shared/components/header/header.component";
import { CapturaApelacionCatalogos, CatalogoItem, ApelacionBusqueda, RelacionBusqueda, ParteBusqueda} from '../../core/models';
import { ApelacionService } from "../../core/services/apelaciones.service";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Router } from '@angular/router';

export interface Parte {
  id: number;
  nombre:      string;
  sexo:        string;
  tipoParte:   string;  // 'Promovente', 'Procesado', etc.
  direccion:   string;
  esMenor:     boolean;
  seleccionada: boolean;
}

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

  // ── Estado de paneles ──────────────────────────────────────
  identificacionOpen  = true;
  partesOpen          = true;
  datosGeneralesOpen  = true;
  relacionesOpen      = false;
  activeTab: 'partes' | 'relaciones' = 'partes';
  relacionesFinalesOpen = false;
  delitosDisponibles: { id: number; nombreDelito: string; seleccionado: boolean }[] = [];
  procesadoSeleccionado: Parte | null = null;
  ofendidoSeleccionado:  Parte | null = null;
  busquedaDelitoTexto = new FormControl('');
  private cdr = inject(ChangeDetectorRef);

  // ── Catálogos ──────────────────────────────────────────────
  materias:         CatalogoItem[] = [];
  apelaciones:      CatalogoItem[] = [];
  tiposApelaciones: CatalogoItem[] = [];
  tiposEscritos:    CatalogoItem[] = [];
  juzgados:         CatalogoItem[] = [];
  municipios:       CatalogoItem[] = [];
  localidades:      CatalogoItem[] = [];
  delitos:          CatalogoItem[] = [];

  // ── Estado UI ──────────────────────────────────────────────
  cargando = false;
  error: string | null = null;
  timeoutMsg = false;
  fechaActual: Date = new Date();
private folioActual = 6;
private anioActual  = new Date().getFullYear();
tipoModal: 'success' | 'error' = 'error';

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
  delitosTemp: { id: string; nombreDelito: string }[] = [];
  // ── Sidebar ────────────────────────────────────────────────
  sidebarActions: SidebarAction[] = [
    { id: 'nuevo',      label: 'Nuevo',      icon: 'nuevo',      primary: true },
    { id: 'guardar',    label: 'Guardar',    icon: 'guardar' },
    { id: 'buscar',     label: 'Buscar',     icon: 'buscar' },
    { id: 'anexo',      label: 'Anexo',      icon: 'anexo' },
    { id: 'certificar', label: 'Certificar', icon: 'certificar' },
  ];

  ngOnInit(): void {
    this.buildForm();
    this.cargarCatalogos();
    setInterval(() => {
    this.fechaActual = new Date();
  }, 1000);
    this.form.patchValue({
    folioOficialia: this.generarFolio()});

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
}

  ngOnDestroy(): void {
  clearInterval(this.intervalId);
}

  private buildForm(): void {
    this.form = this.fb.group({
      busquedaRapida:      [''],
      folioOficialia:      [{ value: '', disabled: true }],
      materiaId:           [null, Validators.required],
      apelacionId:         [null, Validators.required],
      tipoApelacionId:     [null],
      fechaAuto:           [''],
      expedienteCausa:     [''],
      tipoEscritoId:       [null],
      folioOficio:         [''],
      juzgadoId:           [null, Validators.required],
      expedienteAcumulado: [''],
      fojas:               [null],
      municipioId:         [null],
      localidadId:         [null],
      esReposicion:        [false],
      observaciones:       [''],
    });
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
      this.municipios       = data.municipios;
      this.localidades      = data.localidades;
      this.delitos          = data.delitos;
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

private parseMenor(menorEdad: string): boolean {
  return menorEdad?.trim() === '1';
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
private cargarEnFormulario(d: ApelacionBusqueda): void {
  this.form.patchValue({
    expedienteCausa:  d.expedienteCausa,
    fojas:            d.fojas,
    esReposicion:     d.esReposicion,
    fechaAuto: this.toDateInput(d.fechaAuto),
    observaciones:    d.observaciones   ?? '',
    materiaId:        d.materia?.id     ?? null,
    tipoApelacionId:  d.tipoApelacion?.id ?? null,
    tipoEscritoId:    d.tipoEscrito?.id  ?? null,
    juzgadoId:        d.juzgadoOrigen?.id ?? null,
    municipioId:      d.municipio?.id   ?? null,
    localidadId:      d.localidad?.id   ?? null,
  });

  const partesMap = new Map<string, Parte>();

  d.relaciones?.forEach(rel => {
    if (rel.procesado && !partesMap.has(rel.procesado.id)) {
      partesMap.set(rel.procesado.id, {
        id:           Number(rel.procesado.id),
        nombre:       rel.procesado.nombre,
        sexo:         this.formatSexo(rel.procesado.sexo),
        tipoParte:    this.formatTipoParte(rel.procesado.tipoParte),
        direccion:    rel.procesado.direccion === 'N/A' ? '' : rel.procesado.direccion,
        esMenor:      this.parseMenor(rel.procesado.esMenor),
        seleccionada: false,
      });
    }

    if (rel.ofendido && !partesMap.has(rel.ofendido.id)) {
      partesMap.set(rel.ofendido.id, {
        id:           Number(rel.ofendido.id),
        nombre:       rel.ofendido.nombre,
        sexo:         this.formatSexo(rel.ofendido.sexo),
        tipoParte:    this.formatTipoParte(rel.ofendido.tipoParte),
        direccion:    rel.ofendido.direccion === 'N/A' ? '' : rel.ofendido.direccion,
        esMenor:      this.parseMenor(rel.ofendido.esMenor),
        seleccionada: false,
      });
    }
  });

  this.partes     = Array.from(partesMap.values());
  this.relaciones = (d.relaciones ?? []).map(rel => ({
    ...rel,
    delitosRelacion: rel.delitosRelacion.map(delito => {
      const encontrado = this.delitos.find(x => x.id === Number(delito.id));

      return {
        id: delito.id,
        nombreDelito: encontrado?.descripcion ?? 'Delito no encontrado'
      };
    })
  }));
// obtener ids
const idsDelitosRelacion = new Set<number>();

(d.relaciones ?? []).forEach(rel => {
  rel.delitosRelacion.forEach(delito => {
    idsDelitosRelacion.add(Number(delito.id));
  });
});

//normalizar delitos disponibles marcando los que están en la relación
this.delitosDisponibles = this.delitosDisponibles.map(d => ({
  ...d,
  seleccionado: idsDelitosRelacion.has(d.id)
}));
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
      this.incrementarFolio();           // ← incrementa antes de reset
      const folio = this.form.get('folioOficialia')?.value;
      this.form.reset();
      this.partes    = [];
      this.relaciones = [];
      this.procesadoSeleccionado = null;
      this.ofendidoSeleccionado  = null;
      this.busquedaExitosa = false;
      // Restaura el folio ya incrementado (disabled no se resetea con reset())
      // pero por si acaso:
      this.form.patchValue({ folioOficialia: this.generarFolio() });
      break;
    case 'guardar':    this.onGuardar(); break;
    case 'buscar':     this.router.navigate(['/busquedaApelacion']); break;
    case 'anexo':      this.router.navigate(['/anexos']); break;
    case 'certificar': break;
  }
}
// ── Buscador de delitos ────────────────────────────────────
// Filtra las relaciones según el delito buscado
relacionesFiltradas(): RelacionBusqueda[] {
  const q = this.busquedaDelitoTexto.value?.trim().toLowerCase();
  if (!q) return this.relaciones;

  return this.relaciones.filter(rel =>
    rel.delitosRelacion.some(d =>
      d.nombreDelito.toLowerCase().includes(q)
    )
  );
}

toggleMenor(parte: Parte): void {
  parte.esMenor = !parte.esMenor;
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
  console.log('JSON formateado:', JSON.stringify(payload, null, 2));
  console.log('Form raw:', this.form.getRawValue());

    this.apelacionService.guardarApelacion(payload).subscribe({
    next: (res: any) => {
      this.guardando = false;
      console.log('Apelación guardada:', res);
      // éxito
this.mostrarModal('Apelación guardada correctamente.', 'success');
    },
    error: (err) => {
      this.guardando = false;
      console.error('❌ Error al guardar - Status:', err.status);
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
      esMenor:    parteLocal?.esMenor   ?? false,
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
  folioOficialia: raw.folioOficialia,
  folioApelacion: "2026/0001",
  idMateria: raw.materiaId,
  idTipoApelacion: raw.tipoApelacionId ?? null,
  idTipoEscrito: raw.tipoEscritoId ?? null,
  idJuzgado: raw.juzgadoId,
  idMunicipio: raw.municipioId ?? null,
  idLocalidad: raw.localidadId ?? null,
  idEtnia: 2,
  idSala: 2078,
  idNomenclatura: 1,
  fechaAuto: new Date().toISOString(),
  fechaHoraRecepcion: new Date().toISOString(),
  expedienteCausa: raw.expedienteCausa || null,
  expedienteAcumulado: raw.expedienteAcumulado || null,
  folioOficio: raw.folioOficio || null,
  fojas: raw.fojas ?? null,
  Observaciones : raw.observaciones || null,
  fechaHoraIngresoJuz: new Date().toISOString(),
  idMagistradoAsignado: 2,
  lugarHechos:  null,
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
    activo: true,
    procesado: procesado
      ? { id: procesado.id.toString(), nombre: procesado.nombre } as any
      : null,
    ofendido: ofendido
      ? { id: ofendido.id.toString(), nombre: ofendido.nombre } as any
      : null,
    delitosRelacion: [...this.delitosTemp]
  };

  this.relaciones = [...this.relaciones, nuevaRelacion];;

  this.relacionForm.reset();
  this.delitosTemp = [];          // ← limpiar después de guardar
  this.mostrarFormRelacion = false;
}

agregarDelito(event: Event): void {
  event.preventDefault();

  const value = this.relacionForm.get('delitos')?.value?.trim();

  if (!value) return;

  this.delitosTemp.push({
    id: Date.now().toString(),
    nombreDelito: value
  });

  this.relacionForm.get('delitos')?.setValue('');
}

eliminarDelitoDeRelacion(relId: string, delitoId: string): void {
 this.relaciones = this.relaciones
  .map(rel => {
    if (rel.id === relId) {
      return {
        ...rel,
        delitosRelacion: rel.delitosRelacion.filter(d => d.id !== delitoId)
      };
    }
    return rel;
  })
  .filter(rel => rel.delitosRelacion.length > 0);
}

cargarDelitos(): void {
  // Si tienes endpoint de delitos, cárgalos aquí
  // Por ahora los inicializas vacíos o desde el catálogo
  this.delitosDisponibles = (this.delitos ?? []).map(d => ({
    id:            d.id,
    nombreDelito:  d.descripcion,
    seleccionado:  false,
  }));
}

get delitosFiltrados() {
  const q = this.busquedaDelitoTexto.value?.trim().toLowerCase() ?? '';
  if (!q) return this.delitosDisponibles;
  return this.delitosDisponibles.filter(d =>
    d.nombreDelito.toLowerCase().includes(q)
  );
}
get procesados(): Parte[] { return this.partes.filter(p => p.tipoParte === 'Procesado'); }
get ofendidos():  Parte[] { return this.partes.filter(p => p.tipoParte === 'Ofendido'); }
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

  const delitosSeleccionados = this.delitosDisponibles
    .filter(d => d.seleccionado)
    .map(d => ({ id: d.id.toString(), nombreDelito: d.nombreDelito }));

  const nuevaRelacion: RelacionBusqueda = {
    id:      Date.now().toString(),
    activo:  true,
    procesado: {
      id:        this.procesadoSeleccionado.id.toString(),
      nombre:    this.procesadoSeleccionado.nombre,
      sexo:      this.procesadoSeleccionado.sexo,
      tipoParte: this.procesadoSeleccionado.tipoParte,
      direccion: this.procesadoSeleccionado.direccion,
      esMenor:   String(this.procesadoSeleccionado.esMenor),
    },
    ofendido: {
      id:        this.ofendidoSeleccionado.id.toString(),
      nombre:    this.ofendidoSeleccionado.nombre,
      sexo:      this.ofendidoSeleccionado.sexo,
      tipoParte: this.ofendidoSeleccionado.tipoParte,
      direccion: this.ofendidoSeleccionado.direccion,
      esMenor:   String(this.ofendidoSeleccionado.esMenor),
    },
    delitosRelacion: delitosSeleccionados,
  };

  this.relaciones = [...this.relaciones, nuevaRelacion];  // ← nuevo array

  this.delitosDisponibles = this.delitosDisponibles.map(d =>
    ({ ...d, seleccionado: false })
  );
  this.procesadoSeleccionado = null;
  this.ofendidoSeleccionado  = null;
  this.relacionesFinalesOpen = true;  // ← abre automáticamente la sección
  this.cdr.detectChanges();
}

eliminarRelacion(id: string): void {
  this.relaciones = this.relaciones.filter(r => r.id !== id);
}

private generarFolio(): string {
  const num = String(this.folioActual).padStart(4, '0');
  return `${num}/${this.anioActual}`;
}

private incrementarFolio(): void {
  this.folioActual++;
  this.form.patchValue({ folioOficialia: this.generarFolio() });
}


}

import { Injectable, inject, ApplicationConfig } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, switchMap, tap, takeUntil, of } from 'rxjs';  // añadir imports
import { CapturaApelacionCatalogos } from '../models/catalogo-apelaciones.model';
import { mapearDelitosDisponibles } from '../utils/captura-apelaciones.mapper';
import { DelitoDisponible } from '../models/apelacion-aux.model';
import { ApelacionApiService } from '../data/captura-apelacion.service';
import { CatalogoItem } from '../../../../core/models/catalogo-global.model';

@Injectable()
export class CatalogosFacade {

  private apelacionService = inject(ApelacionApiService);
  private destroy$ = new Subject<void>();

  // ── Estado público ─────────────────────────────────────────
  materias:         CatalogoItem[] = [];
  apelaciones:      CatalogoItem[] = [];
  tiposApelaciones: CatalogoItem[] = [];
  tiposEscritos:    CatalogoItem[] = [];
  juzgados:         CatalogoItem[] = [];
  magistrados:      CatalogoItem[] = [];
  localidades:      CatalogoItem[] = [];
  municipios:       CatalogoItem[] = [];
  etnias:           CatalogoItem[] = [];
  delitos:          CatalogoItem[] = [];
  tiposPartes:      CatalogoItem[] = [];
  sexos:            CatalogoItem[] = [];
  folioTentativo    = '';

  cargando            = false;
  cargandoLocalidades = false;
  error: string | null = null;
  timeoutMsg = false;

  onDelitosLisros?: (delitos: DelitoDisponible[]) => void;
  onError?:        (msg: string) => void;

  // ── Carga principal de catálogos ───────────────────────────
  cargar(form: FormGroup, materia: string): void {
    this.cargando   = true;
    this.error      = null;
    this.timeoutMsg = false;
    this.setControlesDisabled(form, true);

    const timer = setTimeout(() => {
      if (this.cargando) this.timeoutMsg = true;
    }, 5000);

    this.apelacionService.getCatalogoCaptura(materia).subscribe({
      next: (data: CapturaApelacionCatalogos) => {
        clearTimeout(timer);
        this.asignarCatalogos(data);
        this.setControlesDisabled(form, false);
        this.onDelitosLisros?.(mapearDelitosDisponibles(this.delitos));
      },
        error: () => {
        clearTimeout(timer);
        this.error    = 'No se pudo conectar con el servidor. Reintentando...';
        this.cargando = false;
        this.onError?.(this.error);
        setTimeout(() => {
          this.apelacionService.invalidarCatalogos();
          this.cargar(form, materia);
        }, 5000);
      },
    });
  }

  // ── Carga las localidades del municipio seleccionado ─────────
escucharMunicipio(form: FormGroup, markForCheck?: () => void): void {
  form.get('municipioId')?.valueChanges
    .pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.localidades = [];
        this.cargandoLocalidades = true;
        form.get('localidadId')?.setValue(null, { emitEvent: false });
        markForCheck?.();  // ← notifica al componente que limpió
      }),
      switchMap(municipioId =>
        municipioId
          ? this.apelacionService.getLocalidades(municipioId)
          : of([])
      )
    )
    .subscribe({
      next: localidades => {
        this.localidades = localidades;
        this.cargandoLocalidades = false;
        markForCheck?.();  // ← notifica que llegaron los datos
      },
      error: () => {
        this.cargandoLocalidades = false;
        markForCheck?.();
      }
    });
}

  // ──Limpieza del facade ─────────────────────────────
  destruir(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // asignar los catálogos a las variables públicas para que el componente los pueda usar
  private asignarCatalogos(data: CapturaApelacionCatalogos): void {
    this.materias         = data.materias;
    this.folioTentativo   = data.folioTentativo;
    this.apelaciones      = data.apelaciones;
    this.tiposApelaciones = data.tiposApelaciones;
    this.tiposEscritos    = data.tiposEscritos;
    this.juzgados         = data.juzgados;
    this.magistrados      = data.magistrados;
    this.municipios       = data.municipios;
    this.etnias           = data.etnias ?? [];
    this.delitos          = data.delitos;
    this.folioTentativo   = data.folioTentativo;
    this.tiposPartes      = data.tiposPartes || [];
    this.sexos            = data.sexos || [];
    this.cargando         = false;
    this.timeoutMsg       = false;
  }

  // habilita o deshabilita los campos del formulario mientras se cargan los catálogos
  // para evitar que el usuario interactúe con ellos antes de tiempo
  private setControlesDisabled(form: FormGroup, disabled: boolean): void {
    ['materiaId', 'apelacionId', 'tipoApelacionId', 'tipoEscritoId',
     'juzgadoId', 'municipioId', 'localidadId'].forEach((campo) => {
      const ctrl = form.get(campo);
      if (!ctrl) return;
      disabled ? ctrl.disable() : ctrl.enable();
    });
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, switchMap, tap, takeUntil, of } from 'rxjs';
import { CapturaApelacionCatalogos } from '../models/catalogo-apelaciones.model';
import { mapearDelitosDisponibles } from '../utils/captura-apelaciones.mapper';
import { DelitoDisponible } from '../models/apelacion-aux.model';
import { ApelacionApiService } from '../data/captura-apelacion.service';
import { CatalogoItem } from '../../../../core/models/catalogo-global.model';

@Injectable()
export class CatalogosFacade {

  private apelacionService = inject(ApelacionApiService);
  private destroy$ = new Subject<void>();

  readonly materias = signal<CatalogoItem[]>([]);
  readonly apelaciones = signal<CatalogoItem[]>([]);
  readonly tiposApelaciones = signal<CatalogoItem[]>([]);
  readonly tiposEscritos = signal<CatalogoItem[]>([]);
  readonly juzgados = signal<CatalogoItem[]>([]);
  readonly magistrados = signal<CatalogoItem[]>([]);
  readonly localidades = signal<CatalogoItem[]>([]);
  readonly municipios = signal<CatalogoItem[]>([]);
  readonly etnias = signal<CatalogoItem[]>([]);
  readonly delitos = signal<CatalogoItem[]>([]);
  readonly tiposPartes = signal<CatalogoItem[]>([]);
  readonly sexos = signal<CatalogoItem[]>([]);
  readonly folioTentativo = signal('');

  readonly cargando = signal(false);
  readonly cargandoLocalidades = signal(false);
  readonly error = signal<string | null>(null);
  readonly timeoutMsg = signal(false);

  onDelitosListos?: (delitos: DelitoDisponible[]) => void;
  onError?:        (msg: string) => void;

  cargar(form: FormGroup, materia: string): void {
    this.cargando.set(true);
    this.error.set(null);
    this.timeoutMsg.set(false);
    this.setControlesDisabled(form, true);

    const timer = setTimeout(() => {
      if (this.cargando()) this.timeoutMsg.set(true);
    }, 5000);

    this.apelacionService.getCatalogoCaptura(materia).subscribe({
      next: (data: CapturaApelacionCatalogos) => {
        clearTimeout(timer);
        this.asignarCatalogos(data);
        this.setControlesDisabled(form, false);
        this.onDelitosListos?.(mapearDelitosDisponibles(this.delitos()));
      },
        error: () => {
        clearTimeout(timer);
        this.error.set('No se pudo conectar con el servidor. Reintentando...');
        this.cargando.set(false);
        this.onError?.(this.error() ?? 'Error desconocido');
        setTimeout(() => {
          this.apelacionService.invalidarCatalogos();
          this.cargar(form, materia);
        }, 5000);
      },
    });
  }

escucharMunicipio(form: FormGroup): void {
  form.get('municipioId')?.valueChanges
    .pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.localidades.set([]);
        this.cargandoLocalidades.set(true);
        form.get('localidadId')?.setValue(null, { emitEvent: false });
      }),
      switchMap(municipioId =>
        municipioId
          ? this.apelacionService.getLocalidades(municipioId)
          : of([])
      )
    )
    .subscribe({
      next: localidades => {
        this.localidades.set(localidades);
        this.cargandoLocalidades.set(false);
      },
      error: () => {
        this.cargandoLocalidades.set(false);
      }
    });
}

  destruir(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private asignarCatalogos(data: CapturaApelacionCatalogos): void {
    this.materias.set(data.materias);
    this.folioTentativo.set(data.folioTentativo);
    this.apelaciones.set(data.apelaciones);
    this.tiposApelaciones.set(data.tiposApelaciones);
    this.tiposEscritos.set(data.tiposEscritos);
    this.juzgados.set(data.juzgados);
    this.magistrados.set(data.magistrados);
    this.municipios.set(data.municipios);
    this.etnias.set(data.etnias ?? []);
    this.delitos.set(data.delitos);
    this.tiposPartes.set(data.tiposPartes || []);
    this.sexos.set(data.sexos || []);
    this.cargando.set(false);
    this.timeoutMsg.set(false);
  }

  private setControlesDisabled(form: FormGroup, disabled: boolean): void {
    ['materiaId', 'apelacionId', 'tipoApelacionId', 'tipoEscritoId',
     'juzgadoId', 'municipioId', 'localidadId'].forEach((campo) => {
      const ctrl = form.get(campo);
      if (!ctrl) return;
      disabled ? ctrl.disable() : ctrl.enable();
    });
  }
}

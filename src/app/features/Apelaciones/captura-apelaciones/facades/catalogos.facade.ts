import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CapturaApelacionCatalogos, CatalogoItem } from '../../../../core/models';
import { ApelacionService } from '../../../../core/services/apelaciones.service';
import { mapearDelitosDisponibles, DelitoDisponible } from '../captura-apelaciones.mapper';

@Injectable()
export class CatalogosFacade {

  private apelacionService = inject(ApelacionService);

  // ── Estado público ─────────────────────────────────────────
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
  tiposPartes:      CatalogoItem[] = [];
  sexos:            CatalogoItem[] = [];
  folioTentativo    = '';

  cargando   = false;
  error: string | null = null;
  timeoutMsg = false;

  // ── Callbacks opcionales para notificar al padre ───────────
  onDelitosLisros?: (delitos: DelitoDisponible[]) => void;
  onError?:        (msg: string) => void;

  cargar(form: FormGroup): void {
    this.cargando   = true;
    this.error      = null;
    this.timeoutMsg = false;
    this.setControlesDisabled(form, true);

    const timer = setTimeout(() => {
      if (this.cargando) this.timeoutMsg = true;
    }, 5000);

    this.apelacionService.getCatalogoCaptura().subscribe({
      next: (data: CapturaApelacionCatalogos) => {
        clearTimeout(timer);
        this.asignarCatalogos(data);
        this.setControlesDisabled(form, false);
        this.onDelitosLisros?.(mapearDelitosDisponibles(this.delitos));
      },
      error: (err) => {
        clearTimeout(timer);
        console.error('Error al cargar catálogos:', err);
        this.error      = 'No se pudo conectar con el servidor. Reintentando...';
        this.cargando   = false;
        this.timeoutMsg = false;
        this.onError?.(this.error);
        setTimeout(() => {
          this.apelacionService.invalidarCatalogos();
          this.cargar(form);
        }, 5000);
      },
    });
  }

  actualizarFolioTentativo(form: FormGroup): void {
    this.apelacionService.getFolioTentativo().subscribe({
      next: (folio) => {
        this.folioTentativo = folio;
        form.patchValue({ folioTentativo: folio });
      },
      error: (err) => console.error('Error al obtener folio tentativo:', err),
    });
  }

  private asignarCatalogos(data: CapturaApelacionCatalogos): void {
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
    this.folioTentativo   = data.folioTentativo;
    this.tiposPartes      = data.tiposPartes || [];
    this.sexos            = data.sexos || [];
    this.cargando         = false;
    this.timeoutMsg       = false;
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

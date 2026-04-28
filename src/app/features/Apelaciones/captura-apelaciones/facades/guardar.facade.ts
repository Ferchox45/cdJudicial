import { Injectable, WritableSignal, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CatalogoItem, Parte, RelacionBusqueda } from '../../../../core/models';
import { ApelacionService } from '../../../../core/services/apelaciones.service';
import { ApelacionContextService } from '../../../../core/services/apelacion-context.service';
import { buildPayload } from '../captura-apelaciones.mapper';

@Injectable()
export class GuardarFacade {

  private apelacionService = inject(ApelacionService);
  private contextoService  = inject(ApelacionContextService);
  private router           = inject(Router);

  guardando = false;

  // ── Callbacks ──────────────────────────────────────────────
  onExito?:    () => void;
  onTerminar?: () => void;   // <-- nuevo: limpia estado del padre
  onError?:    (msg: string) => void;

  guardar(
    form: FormGroup,
    folioTentativo: string,
    relaciones: RelacionBusqueda[],
    partes: Parte[],
    sexos: CatalogoItem[],
    tiposPartes: CatalogoItem[],
    folioGuardado: WritableSignal<string>,
    onModalInvalido: () => void
  ): void {
    if (form.invalid) {
      form.markAllAsTouched();
      onModalInvalido();
      return;
    }

    const payload = buildPayload(
      form.getRawValue(),
      relaciones,
      partes,
      sexos,
      tiposPartes
    );
    console.log('JSON formateado:', JSON.stringify(payload, null, 2));
    this.guardando = true;
    this.apelacionService.guardarApelacion(payload).subscribe({
      next: (res: any) => {
        this.guardando = false;
        if (res.status === 'success') {
          const fol = res.data.folioOficialia;
          folioGuardado.set(fol);
          this.apelacionService.invalidarCatalogos();
          this.contextoService.setContexto(res.data.id, fol);
          this.onExito?.();
        }
      },
      error: (err) => {
        this.guardando = false;
        const msg = err?.error?.message ?? 'Error al guardar la apelación. Intente de nuevo.';
        this.onError?.(msg);
      },
    });
  }

  continuarConAnexos(mostrarModal: WritableSignal<boolean>): void {
    mostrarModal.set(false);
    this.router.navigate(['/anexos']);
  }

  terminarSinAnexos(mostrarModal: WritableSignal<boolean>, form: FormGroup): void {
    mostrarModal.set(false);
    this.contextoService.limpiarContexto();
    form.reset();
    this.onTerminar?.();
  }
}

import { Injectable, WritableSignal, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Parte, RelacionBusqueda } from '../models/busqueda-rap.model';
import { ApelacionContextService } from '../../anexos/data/apelacion-context.service';
import { buildPayload } from '../utils/captura-apelaciones.mapper';
import { ApelacionApiService } from '../data/captura-apelacion.service';
import { CatalogoItem } from '../../../../core/models/catalogo-global.model';
import { ApelacionSaveResponse } from '../models/apelacion-aux.model';
import { SessionStateService } from '../../../permisos/services/session-state.service';

export interface GuardarConfig {
  form: FormGroup;
  relaciones: RelacionBusqueda[];
  partes: Parte[];
  sexos: CatalogoItem[];
  tiposPartes: CatalogoItem[];
  folioGuardado: WritableSignal<string>;
  salaGuardada: WritableSignal<string>;
  onModalInvalido: () => void;
  esActualizacion?: boolean;
  idTramite?: number;
}

@Injectable()
export class GuardarFacade {
  private apelacionService = inject(ApelacionApiService);
  private contextoService = inject(ApelacionContextService);
  private router = inject(Router);
  private sessionState = inject(SessionStateService);

  guardando = false;

  // Callbacks
  onExito?: () => void;
  onTerminar?: () => void;
  onError?: (msg: string) => void;

  guardar(config: GuardarConfig): void {
    const {
      form,
      relaciones,
      partes,
      sexos,
      tiposPartes,
      folioGuardado,
      salaGuardada,
      onModalInvalido,
      esActualizacion,
      idTramite,
    } = config;

    // Construimos el JSON con lo que sea que tenga el form
    const payload = buildPayload(
      form.getRawValue(),
      relaciones,
      partes,
      sexos,
      tiposPartes,
      this.sessionState.idAreaSistemaUsuario(),
      this.sessionState.idPantalla(),
      idTramite,
    );
    // Despues validamos. Si es inválido, detenemos el flujo para que NO se envíe al servidor
    if (form.invalid) {
      form.markAllAsTouched();
      onModalInvalido();
      return;
    }
    // Si todo está bien, mandamos la petición al servidor
    this.guardando = true;
    const request$ = esActualizacion
      ? this.apelacionService.actualizarApelacion(payload)
      : this.apelacionService.guardarApelacion(payload);
    request$.subscribe({
      next: (res: ApelacionSaveResponse) => {
        this.guardando = false;
        if (res?.status === 'success' && res?.data) {
          const fol = res.data.folioOficialia;
          const sala = res.data.sala;
          folioGuardado.set(fol);
          salaGuardada.set(sala);
          this.apelacionService.invalidarCatalogos();
          this.contextoService.setContexto(res.data.id, fol, sala);
          this.onExito?.();
        } else if (esActualizacion && res?.status === 'success') {
          this.onExito?.();
        } else {
          this.onError?.(res?.message || 'Error al guardar la apelación. Intente de nuevo.');
        }
      },
      error: (err) => {
        this.guardando = false;
        const msg = err?.error?.message ?? 'Error al guardar la apelación. Intente de nuevo.';
        this.onError?.(msg);
      },
    });
  }

  // Si el usuario decide agregar anexos, lo llevamos a la siguiente pantalla
  // y mantenemos el contexto para que los anexos se relacionen con la apelación que acabamos de guardar
  continuarConAnexos(mostrarModal: WritableSignal<boolean>): void {
    mostrarModal.set(false);
    this.router.navigate(['/capturaApelacion/anexos']);
  }

  // Si el usuario decide no agregar anexos, limpiamos el contexto y regresamos al inicio
  terminarSinAnexos(mostrarModal: WritableSignal<boolean>, form: FormGroup): void {
    mostrarModal.set(false);
    this.contextoService.limpiarContexto();
    form.reset();
    this.onTerminar?.();
  }
}

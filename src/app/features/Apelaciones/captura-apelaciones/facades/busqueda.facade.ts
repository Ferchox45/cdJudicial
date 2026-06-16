import { Injectable, inject, signal } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { AnexoBusquedaRapida, BusquedaRapida, Parte, RelacionBusqueda } from '../models/busqueda-rap.model';
import { ApelacionApiService } from '../data/captura-apelacion.service';
import {
  mapearPartesDesdeRelaciones,
  mapearRelaciones,
  sincronizarSeleccionDelitos,
  toDateInput,
} from '../utils/captura-apelaciones.mapper';

import { DelitoDisponible } from '../models/apelacion-aux.model';

const CAMPOS_BUSQUEDA = [
  'materiaId', 'apelacionId', 'tipoApelacionId', 'tipoEscritoId',
  'juzgadoId', 'municipioId', 'localidadId', 'magistradoId', 'etniaId',
  'expedienteCausa', 'fechaAuto', 'fojas', 'expedienteAcumulado',
  'folioOficio', 'esReposicion', 'observaciones', 'lugarHechos', 'asunto',
  'magistrados',
];

export interface ResultadoBusqueda {
  partes: Parte[];
  relaciones: RelacionBusqueda[];
  delitosDisponibles: DelitoDisponible[];
}

@Injectable()
export class BusquedaFacade {

  private apelacionService = inject(ApelacionApiService);

  readonly buscando = signal(false);
  readonly busquedaExitosa = signal(false);
  readonly busquedaFallida = signal(false);
  readonly bloquearBtn = signal(true);
  readonly bloquearSeccion = signal(false);
  readonly apelacionId = signal<number | null>(null);
  readonly tieneAnexos = signal(false);
  readonly anexos = signal<AnexoBusquedaRapida[]>([]);
  readonly folioOficialia = signal<string | null>(null);
  readonly sala = signal<string | null>(null);

  onExito?:  (resultado: ResultadoBusqueda) => void;
  onError?:  (msg: string) => void;
  onNuevo?:  () => void;

  buscar(form: FormGroup, delitosDisponibles: DelitoDisponible[]): void {
    const folio = form.get('busquedaRapida')?.value?.trim();

    if (!folio) {
      this.busquedaFallida.set(true);
      this.onError?.('Ingrese un folio para buscar.');
      return;
    }

    this.buscando.set(true);
    this.busquedaExitosa.set(false);
    this.busquedaFallida.set(false);

    this.apelacionService.buscarPorFolio(folio).subscribe({
      next: (data: BusquedaRapida) => {
        this.buscando.set(false);

        if (!data) {
          this.busquedaExitosa.set(false);
          this.busquedaFallida.set(true);
          this.apelacionId.set(null);
          this.tieneAnexos.set(false);
          this.anexos.set([]);
          form.reset();
          form.patchValue({ busquedaRapida: folio });
          return;
        }

        this.busquedaExitosa.set(true);
        this.cargarEnFormulario(form, data, delitosDisponibles);
      },
      error: () => {
        this.buscando.set(false);
        this.busquedaExitosa.set(false);
        this.busquedaFallida.set(true);
        this.apelacionId.set(null);
        this.tieneAnexos.set(false);
        this.anexos.set([]);
        this.onError?.(
          `No se encontró ninguna apelación con el folio "${folio}".
           Por favor, verifique el folio e intente de nuevo.`
        );
        form.reset();
        form.patchValue({ busquedaRapida: folio });
      },
    });
  }

  resetNuevo(form: FormGroup): void {
    this.habilitarCampos(form);
    this.busquedaExitosa.set(false);
    this.busquedaFallida.set(false);
    this.tieneAnexos.set(false);
    this.anexos.set([]);
    this.folioOficialia.set(null);
    this.sala.set(null);
    this.onNuevo?.();
  }

  bloquearCampos(form: FormGroup): void {
    CAMPOS_BUSQUEDA.forEach((c) => form.get(c)?.disable({ emitEvent: false }));
    this.bloquearBtn.set(false);
    this.bloquearSeccion.set(true);
  }

  habilitarCampos(form: FormGroup): void {
    CAMPOS_BUSQUEDA.forEach((c) => form.get(c)?.enable({ emitEvent: false }));
    this.bloquearBtn.set(true);
    this.bloquearSeccion.set(false);
  }

  actualizarValidadoresPorMateria(form: FormGroup, esIndigena: boolean): void {
    const camposNormales = ['apelacionId', 'juzgadoId'];
    const camposIndigena = ['municipioId', 'localidadId', 'etniaId', 'asunto', 'lugarHechos'];

    camposNormales.forEach((campo) => {
      const ctrl = form.get(campo)!;
      esIndigena ? ctrl.clearValidators() : ctrl.setValidators(Validators.required);
      if (esIndigena) ctrl.setValue(null);
      ctrl.updateValueAndValidity({ emitEvent: false });
    });

    camposIndigena.forEach((campo) => {
      const ctrl = form.get(campo)!;
      esIndigena ? ctrl.setValidators(Validators.required) : ctrl.clearValidators();
      if (!esIndigena) ctrl.setValue(campo === 'asunto' || campo === 'lugarHechos' ? '' : null);
      ctrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  private cargarEnFormulario(
    form: FormGroup,
    d: BusquedaRapida,
    delitosDisponibles: DelitoDisponible[]
  ): void {
    this.apelacionId.set(d.id);
    this.tieneAnexos.set(Array.isArray(d.anexos) && d.anexos.length > 0);
    this.anexos.set(d.anexos ?? []);
    this.folioOficialia.set(d.folioOficilia ?? null);
    this.sala.set(d.sala ?? null);
    form.patchValue({
      folioTentativo:      d.folioTentativo,
      expedienteCausa:     d.expedienteCausa,
      expedienteAcumulado: d.expedienteAcumulado,
      folioOficio:         d.folioOficio,
      fojas:               d.fojas,
      esReposicion:        d.esReposicion,
      fechaAuto:           toDateInput(d.fechaAuto),
      observaciones:       d.observaciones ?? '',
      materiaId:           d.catMateria?.id ?? null,
      apelacionId:         d.catApelacion?.id ?? null,
      tipoApelacionId:     d.tipoApelacion?.id ?? null,
      tipoEscritoId:       d.tipoEscrito?.id ?? null,
      juzgadoId:           d.catJuzgado?.id ?? null,
      magistradoId:        d.catMagistrado?.id ?? null,
      etniaId:             d.catEtnia?.id ?? null,
      lugarHechos:         d.lugarHechos ?? null,
      magistrados:         d.magistrados ?? '',
      asunto:              d.asunto ?? null,
      municipioId:         d.catMunicipio?.id ?? null,
      localidadId:         d.catLocalidad?.id ?? null,
    });

    this.bloquearCampos(form);

    const partes = mapearPartesDesdeRelaciones(d.relaciones);
    const relaciones = mapearRelaciones(d.relaciones);
    const delitosActualizados = sincronizarSeleccionDelitos(delitosDisponibles, relaciones);

    this.onExito?.({ partes, relaciones, delitosDisponibles: delitosActualizados });
  }
}

import { DelitoDisponible } from '../../models/apelacion-aux.model';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Parte, RelacionBusqueda} from '../../models/busqueda-rap.model';

@Component({
  selector: 'app-panel-relaciones',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-relaciones.component.html',
})
export class PanelRelacionesComponent {
  // ── Inputs ────────────────────────────────────────────────
  readonly procesados = input<Parte[]>([]);
  readonly ofendidos  = input<Parte[]>([]);
  readonly relaciones = input<RelacionBusqueda[]>([]);
  readonly delitosFiltrados = input<DelitoDisponible[]>([]);
  readonly busquedaDelitoTexto = input.required<FormControl>();
  readonly procesadoSeleccionado = input<Parte | null>(null);
  readonly ofendidoSeleccionado  = input<Parte | null>(null);
  readonly datosGeneralesOpen = input(true);
  readonly relacionesFinalesOpen = input(false);
  readonly bloquearSeccion = input(false);
  readonly bloquearBtn = input(true);

  // ── Outputs ───────────────────────────────────────────────
  readonly seleccionarProcesadoEvt   = output<Parte>();
  readonly seleccionarOfendidoEvt    = output<Parte>();
  readonly marcarTodosProcesadosEvt  = output<void>();
  readonly marcarTodosOfendidosEvt   = output<void>();
  readonly agregarRelacionEvt        = output<void>();
  readonly eliminarDelitoRelacionEvt = output<{ relId: string; delitoId: number | string }>();
  readonly toggleDelitoEvt           = output<DelitoDisponible>();
  readonly toggleDatosGeneralesEvt   = output<void>();
  readonly toggleRelacionesFinalesEvt = output<void>();
}

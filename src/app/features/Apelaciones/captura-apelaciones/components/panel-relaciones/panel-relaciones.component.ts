import { DelitoDisponible } from '../../models/apelacion-aux.model';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
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
  @Input() procesados: Parte[] = [];
  @Input() ofendidos:  Parte[] = [];
  @Input() relaciones: RelacionBusqueda[] = [];
  @Input() delitosFiltrados: DelitoDisponible[] = [];
  @Input() busquedaDelitoTexto!: FormControl;
  @Input() procesadoSeleccionado: Parte | null = null;
  @Input() ofendidoSeleccionado:  Parte | null = null;
  @Input() datosGeneralesOpen = true;
  @Input() relacionesFinalesOpen = false;
  @Input() bloquearSeccion = false;
  @Input() bloquearBtn = true;

  // ── Outputs ───────────────────────────────────────────────
  @Output() seleccionarProcesadoEvt   = new EventEmitter<Parte>();
  @Output() seleccionarOfendidoEvt    = new EventEmitter<Parte>();
  @Output() marcarTodosProcesadosEvt  = new EventEmitter<void>();
  @Output() marcarTodosOfendidosEvt   = new EventEmitter<void>();
  @Output() agregarRelacionEvt        = new EventEmitter<void>();
  @Output() eliminarDelitoRelacionEvt = new EventEmitter<{ relId: string; delitoId: number | string }>();
  @Output() toggleDelitoEvt           = new EventEmitter<DelitoDisponible>();
  @Output() toggleDatosGeneralesEvt   = new EventEmitter<void>();
  @Output() toggleRelacionesFinalesEvt = new EventEmitter<void>();
}

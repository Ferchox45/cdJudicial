import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resultado } from '../../models/busqueda-profunda.model';

@Component({
  selector: 'app-panel-detalle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './panelDetalle.component.html',
})
export class PanelDetalleComponent {
  readonly fila = input.required<Resultado>();
  tabActivo: 'partes' | 'anexos' = 'partes';
}

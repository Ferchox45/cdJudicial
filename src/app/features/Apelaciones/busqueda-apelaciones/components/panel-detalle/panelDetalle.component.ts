import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resultado } from '../../../../../core/models/busqueda-profunda';

@Component({
  selector:    'app-panel-detalle',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './panelDetalle.component.html',
})
export class PanelDetalleComponent {

  /** Fila actualmente seleccionada en la tabla de resultados. */
  readonly fila = input.required<Resultado>();

  readonly tabActiva = signal<'partes' | 'anexos'>('partes');

  setTab(tab: 'partes' | 'anexos'): void {
    this.tabActiva.set(tab);
  }
}

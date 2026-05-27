import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resultado } from '../../models/busqueda-profunda.model';

@Component({
  selector:    'app-panel-detalle',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './panelDetalle.component.html',
})
export class PanelDetalleComponent {

  //Fila seleccionada en la tabla de Resultados
  readonly fila = input.required<Resultado>();

  readonly tabActiva = signal<'partes' | 'anexos'>('partes');

  setTab(tab: 'partes' | 'anexos'): void {
    this.tabActiva.set(tab);
  }
}

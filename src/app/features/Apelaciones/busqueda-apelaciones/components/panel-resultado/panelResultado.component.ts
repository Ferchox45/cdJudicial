import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusquedaFacade } from '../../facades/busqueda.facade';
import { PanelDetalleComponent } from '../panel-detalle/panelDetalle.component';
import { Resultado } from '../../../../../core/models/busqueda-profunda';
import { PaginacionComponent } from '../../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector:    'app-panel-resultados',
  standalone:  true,
  imports:     [CommonModule, PanelDetalleComponent, PaginacionComponent],
  templateUrl: './panelResultado.component.html',
})
export class PanelResultadosComponent {
  readonly busqueda = inject(BusquedaFacade);

  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }

  seleccionar(r: Resultado): void {
    this.busqueda.seleccionarFila(r);
  }

    onBack(): void {
    window.history.back();
  }
}

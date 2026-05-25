import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusquedaPlanaFacade } from '../../facades/busquedaPlana.facade';
import { PaginacionComponent } from '../../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-panel-resultados-plano',
  standalone: true,
  imports: [CommonModule, PaginacionComponent],
  templateUrl: './panelResultadosPlano.component.html',
})
export class PanelResultadosPlanoComponent {
  readonly busquedaPlanaFacade = inject (BusquedaPlanaFacade);
  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }
}

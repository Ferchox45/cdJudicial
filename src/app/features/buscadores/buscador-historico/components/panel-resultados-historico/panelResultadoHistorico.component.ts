// panel-resultados-historico.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuscarFacade } from '../../facades/buscar.facade';
import { PaginacionComponent } from '../../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-panel-resultados-historico',
  standalone: true,
  imports: [CommonModule, PaginacionComponent],
  templateUrl: './panelResultadoHistorico.component.html',
})
export class PanelResultadosHistoricoComponent {
  readonly buscarFacade = inject (BuscarFacade);
  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }

  cambiarPorPagina(event: Event): void {
  const select = event.target as HTMLSelectElement;
  this.buscarFacade.cambiarPorPagina(Number(select.value));
}

}

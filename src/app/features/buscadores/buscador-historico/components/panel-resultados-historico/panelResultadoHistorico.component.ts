// panel-resultados-historico.component.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { BuscarFacade } from '../../facades/buscar.facade';
import { PaginacionComponent } from '../../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-panel-resultados-historico',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginacionComponent],
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

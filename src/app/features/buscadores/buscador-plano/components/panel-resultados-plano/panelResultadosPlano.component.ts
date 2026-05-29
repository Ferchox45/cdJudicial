import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { BusquedaPlanaFacade } from '../../facades/busquedaPlana.facade';
import { PaginacionComponent } from '../../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-panel-resultados-plano',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginacionComponent],
  templateUrl: './panelResultadosPlano.component.html',
})
export class PanelResultadosPlanoComponent {
  readonly busquedaPlanaFacade = inject (BusquedaPlanaFacade);
  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }
}

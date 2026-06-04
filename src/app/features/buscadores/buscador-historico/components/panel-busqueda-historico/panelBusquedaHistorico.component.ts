// panel-busqueda-historico.component.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CatalogoFacade } from '../../facades/catalogo.facade';
import { BuscarFacade } from '../../facades/buscar.facade';
import { FormsModule } from '@angular/forms';
import { SearchFormHistorico } from '../../models/buscador-historico.model';
@Component({
  selector: 'app-panel-busqueda-historico',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './panelBusquedaHistorico.component.html',
})

export class PanelBusquedaHistoricoComponent {

  readonly catalogoFacade = inject(CatalogoFacade);
  readonly buscarFacade = inject(BuscarFacade);

  get form(): SearchFormHistorico {
    return this.buscarFacade.form();
  }

  updateForm(field: keyof SearchFormHistorico, value: string): void {
    this.buscarFacade.form.update(f => ({ ...f, [field]: value }));
  }

  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }
}

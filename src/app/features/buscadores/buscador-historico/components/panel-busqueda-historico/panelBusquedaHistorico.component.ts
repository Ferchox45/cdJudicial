// panel-busqueda-historico.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogoFacade } from '../../facades/catalogo.facade';
import { BuscarFacade } from '../../facades/buscar.facade';
import { FormsModule } from '@angular/forms';
import { searchFormHistorico } from '../../models/buscador-historico.model';
@Component({
  selector: 'app-panel-busqueda-historico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panelBusquedaHistorico.component.html',
})

export class PanelBusquedaHistoricoComponent {

  readonly catalogoFacade = inject(CatalogoFacade);
  readonly buscarFacade = inject(BuscarFacade);

  get Form(): searchFormHistorico {
    return this.buscarFacade.form();
  }

  updateForm(field: keyof searchFormHistorico, value: string): void {
    this.buscarFacade.form.update(f => ({ ...f, [field]: value }));
  }

  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }
}

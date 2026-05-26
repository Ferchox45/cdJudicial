import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogosFacade } from '../../../../apelaciones/busqueda-apelaciones/facades/catalogos.facade';
import { BusquedaPlanaFacade } from '../../facades/busquedaPlana.facade';
import { searchFormPlana } from '../../models/buscador-plano.model';

@Component({
  selector: 'app-panel-busqueda-plano',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panelPlano.component.html',
})
export class PanelBusquedaPlanoComponent {

  readonly catalogos = inject(CatalogosFacade);

  readonly buscarPlana = inject(BusquedaPlanaFacade);

  get Form() {
    return this.buscarPlana.form();
  }

  updateForm(field: keyof searchFormPlana, value: string): void {
    this.buscarPlana.form.update(f => ({ ...f, [field]: value }));
  }

  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }
}

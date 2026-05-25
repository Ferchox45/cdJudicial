import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { searchFormPlanaEstadistica } from '../../../../../core/models/estadisticas';
import { BusquedaEstadisticaFacade } from '../../facades/busquedaEstadistica.facade';
import { CatalogosFacade } from '../../../../apelaciones/busqueda-apelaciones/facades/catalogos.facade';

@Component({
  selector: 'app-panel-busqueda-estadistica',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './panelBusquedaEstadistica.component.html',
})
export class PanelBusquedaEstadisticaComponent {
  // Usando la nueva API de outputs de Angular
  readonly catalogos = inject(CatalogosFacade);
  readonly buscarEstadisticas = inject(BusquedaEstadisticaFacade)

  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }

  get Form(): searchFormPlanaEstadistica {
      return this.buscarEstadisticas.form();
    }
    updateForm(field: keyof searchFormPlanaEstadistica, value: string): void {
      this.buscarEstadisticas.form.update(f => ({ ...f, [field]: value }));
    }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogosFacade } from '../../facades/catalogos.facade';
import { BusquedaFacade } from '../../facades/busqueda.facade';
import { SearchForm } from '../../models/busqueda-profunda.model';

@Component({
  selector:    'app-panel-busqueda',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './panelBusqueda.component.html',
})
export class PanelBusquedaComponent {

  readonly catalogos = inject(CatalogosFacade);
  readonly busqueda  = inject(BusquedaFacade);

  get form(): SearchForm { return this.busqueda.form(); }

  updateForm(field: keyof SearchForm, value: string): void {
    this.busqueda.form.update(f => ({ ...f, [field]: value }));
  }

  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }
}

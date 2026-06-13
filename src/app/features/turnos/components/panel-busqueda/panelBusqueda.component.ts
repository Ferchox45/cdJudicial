import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TurnosFacade } from '../../facades/turnos.facade';
import { TurnoSearchForm } from '../../models/turnos.model';
import { CatalogosFacade } from '../../../apelaciones/busqueda-apelaciones/facades/catalogos.facade';

@Component({
  selector: 'app-panel-busqueda-turnos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './panelBusqueda.component.html',
})
export class PanelBusquedaTurnosComponent {
  readonly facade = inject(TurnosFacade);
  readonly catalogos = inject(CatalogosFacade);

  get form(): TurnoSearchForm {
    return this.facade.form();
  }

  updateForm(field: keyof TurnoSearchForm, value: string): void {
    this.facade.form.update(f => ({ ...f, [field]: value }));
  }

  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }
}

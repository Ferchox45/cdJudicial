import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TurnosFacade } from '../../facades/turnos.facade';
import { TablaReutilizableComponent } from '../../../../shared/components/table-reutilizable/tablaReutilizable.component';
import { TablaColumna } from '../../../../shared/components/table-reutilizable/models/tabla-columna.model';

@Component({
  selector: 'app-panel-resultados-turnos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TablaReutilizableComponent],
  templateUrl: './panelResultados.component.html',
})
export class PanelResultadosTurnosComponent {
  readonly facade = inject(TurnosFacade);

  readonly columnas: TablaColumna[] = [
    { field: 'folioOficialia', label: 'Folio Oficialía', visible: true },
    { field: 'folioApelacion', label: 'Folio Apelación', visible: true },
    { field: 'nomenclatura', label: 'Nomenclatura', visible: true },
    { field: 'folioOficio', label: 'Folio de Oficio', visible: true },
    { field: 'fechaRecepcion', label: 'Fecha de Recepción', visible: true },
    { field: '_fechaTurno', label: 'Fecha Turno', visible: true },
    { field: '_estatus', label: 'Estatus', visible: true, cellClass: (v: string, row: any) => row['_colorEstatus'] ?? '' },
    { field: 'apelacion', label: 'Apelación', visible: true },
    { field: 'tipoApelacion', label: 'Tipo de Apelación', visible: true },
    { field: 'seleccionado', label: 'Seleccionar', visible: true, type: 'checkbox' },
  ];

  onSelectionChange(event: { row: any; checked: boolean }): void {
    const id = event.row.id;
    if (id != null) {
      this.facade.toggleSeleccion(id);
    }
  }
}

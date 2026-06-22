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

  get columnas(): TablaColumna[] {
    const esComun = this.facade.perfilTipo() === 'comun';
    const base: TablaColumna[] = [
      { field: 'folioOficialia', label: 'Folio Oficialía', visible: true },
      { field: 'folioApelacion', label: 'Folio Apelación', visible: true },
      { field: 'nomenclatura', label: 'Nomenclatura', visible: true },
      { field: 'folioOficio', label: 'Folio de Oficio', visible: true },
      { field: 'fechaRecepcion', label: 'Fecha de Recepción', visible: true, type: 'date', dateFormat: 'dd/MM/yyyy HH:mm' },
      { field: 'apelacion', label: 'Apelación', visible: true },
      { field: 'tipoApelacion', label: 'Tipo de Apelación', visible: true },
      { field: 'estadoActual', label: 'Estatus', visible: true, cellClass: (v: string, row: any) => row['_colorEstatus'] ?? '' },
      { field: 'seleccionado', label: 'Seleccionar', visible: true, type: 'checkbox' },
    ];
    const fechaCol: TablaColumna = esComun
      ? { field: 'fechaExportacion', label: 'Fecha Exportación', visible: true, type: 'date', dateFormat: 'dd/MM/yyyy HH:mm' }
      : { field: 'fechaImportacion', label: 'Fecha Importación', visible: true, type: 'date', dateFormat: 'dd/MM/yyyy HH:mm' };
    return [
      ...base.slice(0, 5),
      fechaCol,
      ...base.slice(5),
    ];
  }

  get todosSeleccionados(): boolean {
    const ids = this.facade.resultados().map(r => Number(r.id));
    const seleccionados = this.facade.idsSeleccionados();
    return ids.length > 0 && ids.every(id => seleccionados.includes(id));
  }

  toggleTodos(): void {
    const ids = this.facade.resultados().map(r => Number(r.id));
    this.facade.toggleSeleccionTodos(ids);
  }

  onSelectionChange(event: { row: any; checked: boolean }): void {
    const id = event.row.id;
    if (id != null) {
      this.facade.toggleSeleccion(id);
    }
  }
}

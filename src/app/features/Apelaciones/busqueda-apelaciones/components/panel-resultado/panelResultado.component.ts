import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { BusquedaFacade } from '../../facades/busqueda.facade';
import { PanelDetalleComponent } from '../panel-detalle/panelDetalle.component';
import { Resultado } from '../../models/busqueda-profunda.model';
import { TablaReutilizableComponent } from '../../../../../shared/components/table-reutilizable/tablaReutilizable.component';
import { TablaColumna } from '../../../../../shared/components/table-reutilizable/models/tabla-columna.model';

@Component({
  selector: 'app-panel-resultados',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TablaReutilizableComponent, PanelDetalleComponent],
  templateUrl: './panelResultado.component.html',
})
export class PanelResultadosComponent {
  readonly busqueda = inject(BusquedaFacade);

  readonly columnas: TablaColumna[] = [
    { field: 'folioOficialia', label: 'Folio de Oficialía', visible: true },
    { field: 'folioApelacion', label: 'Folio de Apelación', visible: true },
    { field: 'folioApelacionAnterior', label: 'Folio de Apelación Anterior', visible: true },
    { field: 'tramite', label: 'Trámite', visible: true },
    { field: 'sala', label: 'Sala', visible: true },
    { field: 'salaAnterior', label: 'Sala Anterior', visible: true },
    { field: 'apelacion', label: 'Apelación', visible: true },
    { field: 'tipoApelacion', label: 'Tipo de Apelación', visible: true },
    { field: 'fechaAuto', label: 'Fecha de Auto', visible: true, type: 'date', dateFormat: 'dd/MM/yyyy' },
    { field: 'expedienteCausa', label: 'Exp / Causa', visible: true },
    { field: 'tipoEscrito', label: 'Tipo de Escrito', visible: true },
    { field: 'folioOficio', label: 'Folio de Oficio', visible: true },
    { field: 'fojas', label: 'No. de Fojas', visible: true },
    { field: 'expedienteAcumulado', label: 'Expediente Acumulado', visible: true },
    { field: 'juzgado', label: 'Juzgado', visible: true },
    { field: 'magistradoAsignado', label: 'Magistrado Asignado', visible: true },
    { field: 'fechaHoraRecepcion', label: 'Fecha de Recepcion', visible: true, type: 'date' },
    { field: 'observaciones', label: 'Observaciones', visible: true },
    { field: 'fechaHoraIngresoJuz', label: 'Fecha de Ingreso al Juzgado', visible: true, type: 'date' },
  ];

  seleccionar(r: Resultado): void {
    this.busqueda.seleccionarFila(r);
  }
  onBack(): void {
        window.history.back();
  }
}

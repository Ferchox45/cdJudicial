import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { BuscarFacade } from '../../facades/buscar.facade';
import { TablaReutilizableComponent } from '../../../../../shared/components/table-reutilizable/tablaReutilizable.component';
import { TablaColumna } from '../../../../../shared/components/table-reutilizable/models/tabla-columna.model';

@Component({
  selector: 'app-panel-resultados-historico',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TablaReutilizableComponent],
  templateUrl: './panelResultadoHistorico.component.html',
})
export class PanelResultadosHistoricoComponent {
  readonly buscarFacade = inject(BuscarFacade);

  readonly columnas: TablaColumna[] = [
    { field: 'juzgado', label: 'Juzgado', visible: true },
    { field: 'expedienteCausa', label: 'Exp / Causa', visible: true },
    { field: 'toca', label: 'Toca', visible: true },
    { field: 'sala', label: 'Sala', visible: true },
    { field: 'fechaRecepcionApelacion', label: 'Fecha de Recepción de Apelación', visible: true, type: 'date', dateFormat: 'dd/MM/yyyy' },
    { field: 'fechaApelacion', label: 'Fecha de Apelación', visible: true, type: 'date', dateFormat: 'dd/MM/yyyy' },
    { field: 'imputado', label: 'Imputado', visible: true },
    { field: 'victima', label: 'Víctima', visible: true },
    { field: 'delito', label: 'Delito', visible: true },
  ];
}

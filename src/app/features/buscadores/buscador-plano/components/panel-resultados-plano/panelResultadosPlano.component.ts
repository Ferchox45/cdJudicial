import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { BusquedaPlanaFacade } from '../../facades/busquedaPlana.facade';
import { TablaReutilizableComponent } from '../../../../../shared/components/table-reutilizable/tablaReutilizable.component';
import { TablaColumna } from '../../../../../shared/components/table-reutilizable/models/tabla-columna.model';

@Component({
  selector: 'app-panel-resultados-plano',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TablaReutilizableComponent],
  templateUrl: './panelResultadosPlano.component.html',
})
export class PanelResultadosPlanoComponent {
  readonly busquedaPlanaFacade = inject(BusquedaPlanaFacade);

  readonly columnas: TablaColumna[] = [
    { field: 'folioOficialia', label: 'Folio Oficialia', visible: true },
    { field: 'folioApelacion', label: 'Folio de Apelacion', visible: true },
    { field: 'folioApelacionAnterior', label: 'Folio de Apelacion Anterior', visible: true },
    { field: 'folioOficio', label: 'Folio de Oficio', visible: true },
    { field: 'tramite', label: 'Tramite', visible: true },
    { field: 'fojas', label: 'Fojas', visible: true },
    { field: 'expedienteAcumulado', label: 'Expediente Acumulado', visible: true },
    { field: 'esReposicion', label: 'Reposicion', visible: true },
    { field: 'expedienteCausa', label: 'Expediente / Causa', visible: true },
    { field: 'fechaAuto', label: 'Fecha Auto', visible: true, type: 'date', dateFormat: 'dd/MM/yyyy' },
    { field: 'fechaHoraRecepcion', label: 'Fecha y Hora de Recepción', visible: true, type: 'date' },
    { field: 'fechaHoraIngresoJuz', label: 'Fecha y Hora de Ingreso al Juzgado', visible: true, type: 'date' },
    { field: 'observaciones', label: 'Observaciones', visible: true },
    { field: 'asunto', label: 'Asunto', visible: true },
    { field: 'lugarHechos', label: 'Lugar de los Hechos', visible: true },
    { field: 'sala', label: 'Sala', visible: true },
    { field: 'salaAnterior', label: 'Sala Anterior', visible: true },
    { field: 'juzgado', label: 'Juzgado', visible: true },
    { field: 'magistrado', label: 'Magistrado', visible: true },
    { field: 'nomenclatura', label: 'Nomenclatura', visible: true },
    { field: 'apelacion', label: 'Apelacion', visible: true },
    { field: 'tipoApelacion', label: 'Tipo de Apelacion', visible: true },
    { field: 'tipoEscrito', label: 'Tipo de Escrito', visible: true },
  ];
}

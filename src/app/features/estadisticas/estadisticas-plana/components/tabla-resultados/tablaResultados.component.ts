import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { BusquedaEstadisticaFacade } from '../../facades/busquedaEstadistica.facade';
import { TablaReutilizableComponent } from '../../../../../shared/components/table-reutilizable/tablaReutilizable.component';
import { TablaColumna } from '../../../../../shared/components/table-reutilizable/models/tabla-columna.model';

@Component({
  selector: 'app-tabla-resultados',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tablaResultados.component.html',
  imports: [TablaReutilizableComponent],
})
export class TablaResultadosComponent {
  readonly busquedaEstadisticas = inject(BusquedaEstadisticaFacade);

  readonly columnas: TablaColumna[] = [
    { field: 'sala', label: 'Sala', visible: true },
    { field: 'tramite', label: 'Tramite', visible: true },
    { field: 'folioOficialia', label: 'Folio de Oficialia', visible: true },
    { field: 'nomenclatura', label: 'Nomenclatura', visible: true },
    { field: 'folioToca', label: 'Folio del Toca', visible: true },
    { field: 'apelacion', label: 'Apelacion', visible: true },
    { field: 'tipoApelacion', label: 'Tipo de Apelacion', visible: true },
    { field: 'tipoEscrito', label: 'Tipo de Escrito', visible: true },
    { field: 'fechaHoraRecepcion', label: 'Fecha y Hora de Recepción', visible: true },
    { field: 'fechaHoraIngresoJuzgado', label: 'Fecha y Hora de Ingreso al Juzgado', visible: true },
    { field: 'juzgadoOrigen', label: 'Juzgado', visible: true },
    { field: 'mesRecep', label: 'Mes de Recepcion', visible: true },
    { field: 'anioRecep', label: 'Año de Recepcion', visible: true },
    { field: 'mesIngreso', label: 'Mes de Ingreso', visible: true },
    { field: 'anioIngreso', label: 'Año de Ingreso', visible: true },
  ];
}

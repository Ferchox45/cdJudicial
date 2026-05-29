import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { BusquedaEstadisticaFacade } from '../../facades/busquedaEstadistica.facade';
import { PaginacionComponent } from '../../../../../shared/components/paginacion/paginacion.component';
import { TablaColumna } from '../../models/estadisticas';
@Component({
  selector: 'app-tabla-resultados',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tablaResultados.component.html',
  imports: [PaginacionComponent],
})
export class TablaResultadosComponent {
readonly busquedaEstadisticas = inject(BusquedaEstadisticaFacade);
  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }
  menuColumnasAbierto = false;
  columnasVisibles = computed(() => this.columnas().filter(c => c.visible));
  columnas = signal<TablaColumna[]>([
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
    { field: 'anioIngreso', label: 'Año de Ingreso', visible: true }
  ]);

  toggleMenuColumnas() {
    this.menuColumnasAbierto = !this.menuColumnasAbierto;
  }

  //Método para cambiar el estado de visibilidad de una columna específica
  toggleColumna(field: string) {
    this.columnas.update(cols =>
      cols.map(c => c.field === field ? { ...c, visible: !c.visible } : c)
    );
  }


mostrarTodas() {
  this.columnas.update(cols => cols.map(c => ({ ...c, visible: true })));
}

ocultarTodas() {
  this.columnas.update(cols => cols.map(c => ({ ...c, visible: false })));
}
}

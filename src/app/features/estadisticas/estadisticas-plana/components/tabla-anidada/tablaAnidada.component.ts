import { ChangeDetectionStrategy, Component, inject, computed, output, input, signal } from '@angular/core';

import { BusquedaEstadisticaFacade } from '../../facades/busquedaEstadistica.facade';
import { TableRow, ChartSlice, TableRowRich } from '../../models/estadisticas';
import { buildTableRows }   from './utils/tabla-builder';
import { applyVisibility }  from './utils/tabla-visibility';
import { buildKey, NivelColapso } from './utils/tabla-keys';

@Component({
  selector: 'app-tabla-anidada',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './tablaAnidada.component.html',
})
export class TablaAnidadaComponent {
  readonly facade = inject(BusquedaEstadisticaFacade);

  filaClic = output<TableRowRich>();
  celdaClic  = output<{ data: ChartSlice[]; title: string }>();
  filaActiva = input<TableRow | null>(null);

  abierto         = true;
  collapsedGroups = signal<Set<string>>(new Set());

  toggle(): void { this.abierto = !this.abierto; }

  onRowClick(row: TableRow): void { this.filaClic.emit(row); }

  onCeldaClick(data: ChartSlice[], title: string): void {
    this.celdaClic.emit({ data, title });
  }

  toggleColapso(row: any, nivel: NivelColapso): void {
    const set = new Set(this.collapsedGroups());
    const key = buildKey(row, nivel);
    set.has(key) ? set.delete(key) : set.add(key);
    this.collapsedGroups.set(set);
  }

readonly tableData = computed(() => {
  const data = this.facade.dataJerarquica();
  if (!data?.length) return { rows: [] as TableRowRich[], totalGeneral: 0 };

  const { rows, totalGeneral } = buildTableRows(data);
  const visibleRows = applyVisibility(rows, this.collapsedGroups());

  return { rows: visibleRows, totalGeneral };  // sin cast, el tipo ya es correcto
});
}
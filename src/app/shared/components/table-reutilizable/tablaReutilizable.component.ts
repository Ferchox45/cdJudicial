import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, TemplateRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginacionComponent } from '../paginacion/paginacion.component';
import { TablaColumna } from './models/tabla-columna.model';

@Component({
  selector: 'app-table-reutilizable',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PaginacionComponent],
  providers: [DatePipe],
  templateUrl: './tablaReutilizable.component.html',
})
export class TablaReutilizableComponent {
  private readonly datePipe = inject(DatePipe);

  readonly columns = input<TablaColumna[]>([]);
  readonly data = input<any[]>([]);
  readonly paginaActual = input.required<number>();
  readonly totalPaginas = input.required<number>();
  readonly totalResultados = input.required<number>();
  readonly porPagina = input.required<number>();
  readonly titulo = input('Resultados de Búsqueda');
  readonly mostrarColumnSelector = input(true);
  readonly filaSeleccionada = input<any>(null);
  readonly expandedTemplate = input<TemplateRef<any>>();
  readonly showSelectAll = input(false);
  readonly allSelected = input(false);

  readonly paginaCambio = output<number>();
  readonly limitCambio = output<number>();
  readonly rowClick = output<any>();
  readonly toggleAbierto = output<boolean>();
  readonly selectionChange = output<{ row: any; checked: boolean }>();
  readonly selectAllChange = output<boolean>();

  abierto = true;
  menuColumnasAbierto = false;

  columnas = signal<TablaColumna[]>([]);
  columnasVisibles = computed(() => this.columnas().filter(c => c.visible));

  constructor() {
    effect(() => {
      const cols = this.columns();
      if (cols.length > 0) {
        this.columnas.set(cols.map(c => ({...c})));
      }
    });
  }

  toggle(): void {
    this.abierto = !this.abierto;
    this.toggleAbierto.emit(this.abierto);
  }

  toggleMenuColumnas(): void {
    this.menuColumnasAbierto = !this.menuColumnasAbierto;
  }

  onSelectAllToggle(): void {
    this.selectAllChange.emit(!this.allSelected());
  }

  toggleColumna(field: string): void {
    this.columnas.update(cols =>
      cols.map(c => c.field === field ? { ...c, visible: !c.visible } : c)
    );
  }

  onCheckboxChange(row: any, field: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    row[field] = checked;
    this.selectionChange.emit({ row, checked });
  }

  getCellClass(col: TablaColumna, row: any): string {
    if (!col.cellClass) return '';
    if (typeof col.cellClass === 'string') return col.cellClass;
    return col.cellClass(row[col.field], row);
  }

formatDate(value: string, format: string = 'dd/MM/yyyy HH:mm:ss'): string {
  if (!value || value === '—' || value === '-') {
      return '—';
    }
    try {
      return this.datePipe.transform(value, format) ?? value;
    } catch (error) {
      return '—';
    }
  }

  onSelectAllChange(event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  this.selectAllChange.emit(checked);
}

  mostrarTodas(): void {
    this.columnas.update(cols => cols.map(c => ({ ...c, visible: true })));
  }

  ocultarTodas(): void {
    this.columnas.update(cols => cols.map(c => ({ ...c, visible: false })));
  }
}

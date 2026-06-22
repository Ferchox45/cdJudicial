import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActionSidebarComponent, SidebarAction } from '../../../shared/components/action-sidebar/action-sidebar.component';
import { TablaReutilizableComponent } from '../../../shared/components/table-reutilizable/tablaReutilizable.component';
import { TablaColumna } from '../../../shared/components/table-reutilizable/models/tabla-columna.model';
import { KardexFacade } from '../facades/kardex.facade';

@Component({
  selector: 'app-kardex',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ActionSidebarComponent, TablaReutilizableComponent],
  templateUrl: './kardex.component.html',
})
export class KardexComponent {
  readonly facade = inject(KardexFacade);

  get columnas(): TablaColumna[] {
    return [
      { field: 'paso', label: 'Paso por:', visible: true },
      { field: 'nombreTurna', label: 'Turnó', visible: true },
      { field: 'cargoTurna', label: 'Cargo Turnó', visible: true },
      { field: 'fechaTurno', label: 'Fecha de Turnado', visible: true, type: 'date', dateFormat: 'dd/MM/yyyy HH:mm' },
      { field: 'nombreRecibe', label: 'Recibió', visible: true },
      { field: 'cargoRecibe', label: 'Cargo Recibió', visible: true },
      { field: 'fechaRecibe', label: 'Fecha de Recepción', visible: true, type: 'date', dateFormat: 'dd/MM/yyyy HH:mm' },
    ];
  }

  get sidebarActions(): SidebarAction[] {
    const buscando = this.facade.buscando();

    return [
      {
        id: 'buscar',
        label: 'Buscar',
        icon: 'buscar',
        primary: true,
        loading: buscando,
        disabled: buscando,
      },
      {
        id: 'limpiar',
        label: 'Limpiar',
        icon: 'limpiar',
        disabled: buscando,
      },
    ];
  }

  onAction(id: string): void {
    const acciones: Record<string, () => void> = {
      buscar: () => this.facade.buscar(),
      limpiar: () => this.facade.limpiar(),
    };
    acciones[id]?.();
  }

  constructor() {
    this.facade.limpiar();
  }
}

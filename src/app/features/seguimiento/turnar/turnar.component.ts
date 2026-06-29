import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActionSidebarComponent, SidebarAction } from '../../../shared/components/action-sidebar/action-sidebar.component';
import { TablaReutilizableComponent } from '../../../shared/components/table-reutilizable/tablaReutilizable.component';
import { TablaColumna } from '../../../shared/components/table-reutilizable/models/tabla-columna.model';
import { TurnarFacade } from '../facades/turnar.facade';
import { SessionStateService } from '../../permisos/services/session-state.service';
@Component({
  selector: 'app-turnar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ActionSidebarComponent,
    TablaReutilizableComponent,
  ],
  templateUrl: './turnar.component.html',
})
export class TurnarComponent {
  readonly facade = inject(TurnarFacade);
  private sessionState = inject(SessionStateService);
  readonly salaInfo = this.sessionState.salaInfo;
  readonly salasDisponibles = this.sessionState.salasDisponibles;

  get sidebarActions(): SidebarAction[] {
    const cargando = this.facade.cargando();
    const turnando = this.facade.turnando();
    const deshabilitado = cargando || turnando;

    return [
      {
        id: 'turnar',
        label: 'Turnar',
        icon: 'turnar',
        primary: true,
        disabled: !this.facade.turnarHabilitado() || deshabilitado,
        loading: turnando,
      },
      {
        id: 'buscar',
        label: 'Buscar',
        icon: 'buscar',
        disabled: deshabilitado,
        loading: cargando,
      },
    ];
  }

  get columnas(): TablaColumna[] {
    return [
      { field: 'folioApelacion', label: 'Folio Apelación', visible: true },
      { field: 'nomenclatura', label: 'Nomenclatura', visible: true },
      { field: 'cargoOrigen', label: 'Quién te lo turnó', visible: true },
      { field: 'fechaRecibe', label: 'Fecha de recepción', visible: true, type: 'date', dateFormat: 'dd/MM/yyyy HH:mm' },
      { field: 'cargoDestino', label: 'Cargo destino', visible: true },
      { field: 'seleccionado', label: 'Seleccionar', visible: true, type: 'checkbox' },
    ];
  }

  onAction(id: string): void {
    const acciones: Record<string, () => void> = {
      turnar: () => this.facade.turnar(),
      buscar: () => this.facade.refrescar(),
    };
    acciones[id]?.();
  }

  onSelectionChange(event: { row: any; checked: boolean }): void {
    const id = event.row.idApelacion;
    if (id != null) {
      this.facade.toggleSeleccion(Number(id));
    }
  }

  constructor() {
    this.facade.limpiar();
  }
}

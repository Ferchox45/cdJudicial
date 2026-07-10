import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ActionSidebarComponent,
  SidebarAction,
} from '../../../shared/components/action-sidebar/action-sidebar.component';
import { TablaReutilizableComponent } from '../../../shared/components/table-reutilizable/tablaReutilizable.component';
import { TablaColumna } from '../../../shared/components/table-reutilizable/models/tabla-columna.model';
import { RecibirFacade } from '../facades/recibir.facade';
import { SessionStateService } from '../../permisos/services/session-state.service';

@Component({
  selector: 'app-recibir',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionSidebarComponent, TablaReutilizableComponent],
  templateUrl: './recibir.component.html',
})
export class RecibirComponent {
  readonly facade = inject(RecibirFacade);
  private sessionState = inject(SessionStateService);
  readonly sala = this.sessionState.salaInfo;

  get sidebarActions(): SidebarAction[] {
    const cargando = this.facade.cargando();
    const recibiendo = this.facade.recibiendo();
    const deshabilitado = cargando || recibiendo;

    return [
      {
        id: 'recibir',
        label: 'Recibir',
        icon: 'certificar',
        primary: true,
        disabled: !this.facade.haySeleccion() || deshabilitado,
        loading: recibiendo,
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
      { field: 'folioApelacion', label: 'Folio de Apelación', visible: true },
      { field: 'nomenclatura', label: 'Nomenclatura', visible: true },
      { field: 'cargoOrigen', label: 'Cargo de Origen', visible: true },
      { field: 'nombreTurna', label: 'Turnado por', visible: true },
      {
        field: 'fechaTurno',
        label: 'Fecha y Hora de Turno',
        visible: true,
        type: 'date',
        dateFormat: 'dd/MM/yyyy HH:mm',
      },
      { field: 'cargoDestino', label: 'Cargo Destino', visible: true },
      { field: 'seleccionado', label: 'Seleccionar', visible: true, type: 'checkbox' },
    ];
  }

  get todosSeleccionados(): boolean {
    const ids = this.facade.pendientes().map((p) => Number(p.id));
    const seleccionados = this.facade.idsSeleccionados();
    return ids.length > 0 && ids.every((id) => seleccionados.includes(id));
  }

  toggleTodos(): void {
    const ids = this.facade.pendientes().map((p) => Number(p.id));
    this.facade.toggleSeleccionTodos(ids);
  }

  onAction(id: string): void {
    const acciones: Record<string, () => void> = {
      recibir: () => this.facade.recibir(),
      buscar: () => this.facade.refrescar(),
    };
    acciones[id]?.();
  }

  onSelectionChange(event: { row: any; checked: boolean }): void {
    const id = event.row.id;
    if (id != null) {
      this.facade.toggleSeleccion(Number(id));
    }
  }

  constructor() {
    this.facade.limpiar();
  }
}

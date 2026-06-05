import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner.component';

export interface SidebarAction {
  id: string;
  label: string;
  icon: 'nuevo' | 'guardar' | 'buscar' |
        'anexo' | 'exportar' | 'limpiar'|
        'reporte'| 'resultado' | 'grafica';
  primary?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const DEFAULT_ACTIONS: SidebarAction[] = [
  { id: 'nuevo',   label: 'Nuevo',   icon: 'nuevo',   primary: true },
  { id: 'guardar', label: 'Guardar', icon: 'guardar' },
  { id: 'buscar',  label: 'Buscar',  icon: 'buscar'  },
  { id: 'anexo',   label: 'Anexo',   icon: 'anexo'   },
];

@Component({
  selector: 'app-action-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './action-sidebar.component.html',
})
export class ActionSidebarComponent {
  readonly actions = input<SidebarAction[]>(DEFAULT_ACTIONS);

  readonly actionClick = output<string>();

  onClick(action: SidebarAction) {
    if (!action.disabled && !action.loading) {
      this.actionClick.emit(action.id);
    }
  }

  isIcon(action: SidebarAction, icon: string): boolean {
    return action.icon === icon;
  }
}

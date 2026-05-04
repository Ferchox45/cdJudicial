import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SidebarAction {
  id: string;
  label: string;
  icon: 'nuevo' | 'guardar' | 'buscar' | 'anexo'| 'exportar' | 'limpiar';
  primary?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-action-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-siderbar.component.html',
})
export class ActionSidebarComponent {
  @Input() actions: SidebarAction[] = [
    { id: 'nuevo',      label: 'Nuevo',      icon: 'nuevo',      primary: true },
    { id: 'guardar',    label: 'Guardar',    icon: 'guardar' },
    { id: 'buscar',     label: 'Buscar',     icon: 'buscar' },
    { id: 'anexo',      label: 'Anexo',      icon: 'anexo' },
  ];

  @Output() actionClick = new EventEmitter<string>();

  onClick(id: string) {
    this.actionClick.emit(id);
  }

  isIcon(action: SidebarAction, icon: string): boolean {
  return action.icon === icon;
}

}

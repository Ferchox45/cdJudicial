import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainHeaderComponent } from '../../../shared/components/header/header.component';
import { ActionSidebarComponent } from '../../../shared/components/Action-siderbar/action-siderbar.component';
import { PanelBusquedaPlanoComponent } from './components/panel-buscador-plano/panlePlano.component';
import { PanelResultadosPlanoComponent } from './components/panel-resultados-plano/panelResultadosPlano.component';
import { SidebarAction } from '../../../shared/components/Action-siderbar/action-siderbar.component';

@Component({
  selector: 'app-buscador-historico',
  standalone: true,
  imports: [
    CommonModule,
    MainHeaderComponent,
    ActionSidebarComponent,
    PanelBusquedaPlanoComponent,
    PanelResultadosPlanoComponent,
  ],
  templateUrl: './buscadorPlano.component.html',
})
export class BuscadorPlanoComponent {
    get sidebarActions(): SidebarAction[] {
      return [
        { id: 'buscar',   label: 'Buscar',   icon: 'buscar',   primary: true },
        { id: 'exportar', label: 'Exportar', icon: 'exportar' },
        { id: 'limpiar',  label: 'Limpiar',  icon: 'limpiar'  },
      ];
    }
  onAction(_event: any): void {}
}

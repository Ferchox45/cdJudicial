// historico-apelaciones.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainHeaderComponent } from '../../../shared/components/header/header.component';
import { ActionSidebarComponent } from '../../../shared/components/Action-siderbar/action-siderbar.component';
import { PanelBusquedaHistoricoComponent } from './components/panel-busqueda-historico/panelBusquedaHistorico.component';
import { PanelResultadosHistoricoComponent } from './components/panel-resultados-historico/panelResultadoHistorico.component';

@Component({
  selector: 'app-buscador-historico',
  standalone: true,
  imports: [
    CommonModule,
    MainHeaderComponent,
    ActionSidebarComponent,
    PanelBusquedaHistoricoComponent,
    PanelResultadosHistoricoComponent,
  ],
  templateUrl: './buscadorHistorico.component.html',
})
export class BuscadorHistoricoComponent {
  sidebarActions: any[] = [];
  onAction(_event: any): void {}
}

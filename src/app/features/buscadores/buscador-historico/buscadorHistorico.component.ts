// historico-apelaciones.component.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ActionSidebarComponent } from '../../../shared/components/action-sidebar/action-sidebar.component';
import { PanelBusquedaHistoricoComponent } from './components/panel-busqueda-historico/panelBusquedaHistorico.component';
import { PanelResultadosHistoricoComponent } from './components/panel-resultados-historico/panelResultadoHistorico.component';
import { SidebarAction } from '../../../shared/components/action-sidebar/action-sidebar.component';
import { CatalogoFacade } from './facades/catalogo.facade';
import { BuscarFacade } from './facades/buscar.facade';
@Component({
  selector: 'app-buscador-historico',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ActionSidebarComponent,
    PanelBusquedaHistoricoComponent,
    PanelResultadosHistoricoComponent
],
  templateUrl: './buscadorHistorico.component.html',

})
export class BuscadorHistoricoComponent {

    private readonly catalogoFacade = inject (CatalogoFacade);
    readonly buscarFacade = inject (BuscarFacade);

  get sidebarActions(): SidebarAction[] {
    const buscando   = this.buscarFacade.buscando();
    const exportando = this.buscarFacade.exportando();  // solo Excel/CSV
    const generando  = this.buscarFacade.generando();   // solo PDF/Reporte

    const ocupado = buscando || exportando || generando;  // bloqueo global

    return [
      {
        id:      'buscar',
        label:   'Buscar',
        icon:    'buscar',
        primary:  true,
        loading:  buscando,
        disabled: ocupado,
      },
      {
        id:       'exportar',
        label:    'Exportar',
        icon:     'exportar',
        loading:   exportando,
        disabled:  ocupado,
      },
      {
        id:       'limpiar',
        label:    'Limpiar',
        icon:     'limpiar',
        disabled:  ocupado,
      },
      {
        id:       'reporte',
        label:    'Reporte',
        icon:     'reporte',
        loading:   generando,
        disabled:  ocupado,
      },
    ];
  }
  onAction(id: string): void {
    const acciones: Record<string, () => void> = {
      buscar:   () => this.buscarFacade.buscar(),
      exportar: () => this.buscarFacade.exportarExcel(),
      limpiar:  () => this.buscarFacade.limpiar(),
      reporte:  () => this.buscarFacade.exportarPdf(),
    };
    acciones[id]?.();
  }

  ngOnInit(): void {
      this.catalogoFacade.cargar();
  }
}

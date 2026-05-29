import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ActionSidebarComponent } from '../../../shared/components/Action-siderbar/action-siderbar.component';
import { PanelBusquedaPlanoComponent } from './components/panel-buscador-plano/panlePlano.component';
import { PanelResultadosPlanoComponent } from './components/panel-resultados-plano/panelResultadosPlano.component';
import { SidebarAction } from '../../../shared/components/Action-siderbar/action-siderbar.component';
import { CatalogosFacade } from '../../apelaciones/busqueda-apelaciones/facades/catalogos.facade';
import { BusquedaPlanaFacade } from './facades/busquedaPlana.facade';

@Component({
  selector: 'app-buscador-plano',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ActionSidebarComponent,
    PanelBusquedaPlanoComponent,
    PanelResultadosPlanoComponent
],
  templateUrl: './buscadorPlano.component.html',
})
export class BuscadorPlanoComponent {

  private readonly catalogosFacade = inject(CatalogosFacade);
  readonly buscarPlanoFacade = inject(BusquedaPlanaFacade);

    get sidebarActions(): SidebarAction[] {
    const buscando   = this.buscarPlanoFacade.buscando();
    const exportando = this.buscarPlanoFacade.exportando();  // solo Excel/CSV
    const generando  = this.buscarPlanoFacade.generando();   // solo PDF/Reporte

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
      buscar:   () => this.buscarPlanoFacade.buscar(),
      exportar: () => this.buscarPlanoFacade.exportarExcel(),
      limpiar:  () => this.buscarPlanoFacade.limpiar(),
      reporte:  () => this.buscarPlanoFacade.exportarPdf(),
    };
    acciones[id]?.();
  }

    ngOnInit(): void {
    this.catalogosFacade.cargar();
  }
}

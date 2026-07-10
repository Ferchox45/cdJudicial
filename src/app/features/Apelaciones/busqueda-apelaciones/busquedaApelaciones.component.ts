import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import {
  ActionSidebarComponent,
  SidebarAction,
} from '../../../shared/components/action-sidebar/action-sidebar.component';
import { PanelBusquedaComponent } from './components/panel-busqueda/panelBusqueda.component';
import { PanelResultadosComponent } from './components/panel-resultado/panelResultado.component';
import { BusquedaFacade } from './facades/busqueda.facade';
import { CatalogosFacade } from './facades/catalogos.facade';

@Component({
  selector: 'app-busqueda-apelaciones',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionSidebarComponent, PanelBusquedaComponent, PanelResultadosComponent],
  templateUrl: './busquedaApelaciones.component.html',
  providers: [BusquedaFacade, CatalogosFacade],
})
export class BusquedaApelacionesComponent implements OnInit {
  private readonly catalogosFacade = inject(CatalogosFacade);
  readonly busquedaFacade = inject(BusquedaFacade);

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  get sidebarActions(): SidebarAction[] {
    const buscando = this.busquedaFacade.buscando();
    const exportando = this.busquedaFacade.exportando();
    const generando = this.busquedaFacade.generando();

    const ocupado = buscando || exportando || generando;

    return [
      {
        id: 'buscar',
        label: 'Buscar',
        icon: 'buscar',
        primary: true,
        loading: buscando,
        disabled: ocupado,
      },
      {
        id: 'exportar',
        label: 'Exportar',
        icon: 'exportar',
        loading: exportando,
        disabled: ocupado,
      },
      {
        id: 'limpiar',
        label: 'Limpiar',
        icon: 'limpiar',
        disabled: ocupado,
      },
      {
        id: 'reporte',
        label: 'Reporte',
        icon: 'reporte',
        loading: generando,
        disabled: ocupado,
      },
    ];
  }

  ngOnInit(): void {
    this.catalogosFacade.cargar();
  }

  // ── Acciones ─────────────────────────────────────────────────────────────────
  onAction(id: string): void {
    const acciones: Record<string, () => void> = {
      buscar: () => this.busquedaFacade.buscar(),
      exportar: () => this.busquedaFacade.exportar(),
      limpiar: () => this.busquedaFacade.limpiar(),
      reporte: () => this.busquedaFacade.exportarPdf(),
    };
    acciones[id]?.();
  }
}

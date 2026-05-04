import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainHeaderComponent } from '../../../shared/components/header/header.component';
import { ActionSidebarComponent, SidebarAction } from '../../../shared/components/Action-siderbar/action-siderbar.component';
import { PanelBusquedaComponent } from './components/panel-busqueda/panelBusqueda.component';
import { PanelResultadosComponent } from './components/panel-resultado/panelResultado.component';

import { BusquedaFacade } from './facades/busqueda.facade';
import { CatalogosFacade } from './facades/catalogos.facade';

@Component({
  selector:    'app-busqueda-apelaciones',
  standalone:  true,
  imports: [
    CommonModule,
    MainHeaderComponent,
    ActionSidebarComponent,
    PanelBusquedaComponent,
    PanelResultadosComponent,
  ],
  templateUrl: './busquedaApelaciones.component.html',
  // Las facades se proveen aquí para que compartan la misma instancia
  // entre el componente raíz y todos sus hijos.
  providers: [BusquedaFacade, CatalogosFacade],
})
export class BusquedaApelacionesComponent implements OnInit {

  private readonly catalogosFacade = inject(CatalogosFacade);
  readonly busquedaFacade          = inject(BusquedaFacade);

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  get sidebarActions(): SidebarAction[] {
    return [
      { id: 'buscar',   label: 'Buscar',   icon: 'buscar',   primary: true },
      { id: 'exportar', label: 'Exportar', icon: 'exportar', disabled: this.busquedaFacade.exportando() },
      { id: 'limpiar',  label: 'Limpiar',  icon: 'limpiar'  },
    ];
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.catalogosFacade.cargar();
  }

  // ── Acciones ─────────────────────────────────────────────────────────────────

  onAction(id: string): void {
    const acciones: Record<string, () => void> = {
      buscar:   () => this.busquedaFacade.buscar(),
      exportar: () => this.busquedaFacade.exportar(),
      limpiar:  () => this.busquedaFacade.limpiar(),
    };
    acciones[id]?.();
  }
}

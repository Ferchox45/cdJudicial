import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    ActionSidebarComponent,
    PanelBusquedaComponent,
    PanelResultadosComponent,
  ],
  templateUrl: './busquedaApelaciones.component.html',
  providers: [BusquedaFacade, CatalogosFacade],
})
export class BusquedaApelacionesComponent implements OnInit {

  private readonly catalogosFacade = inject(CatalogosFacade);
  readonly busquedaFacade          = inject(BusquedaFacade);

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  get sidebarActions(): SidebarAction[] {
    const buscando   = this.busquedaFacade.buscando();
    const exportando = this.busquedaFacade.exportando();  // solo Excel/CSV
    const generando  = this.busquedaFacade.generando();   // solo PDF/Reporte

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
      reporte:  () => this.busquedaFacade.exportarPdf(),
    };
    acciones[id]?.();
  }
}

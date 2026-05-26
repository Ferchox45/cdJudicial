import { GraficaTotalesComponent } from './components/graficas-plana/graficaPlana.component';
import { TablaResultadosComponent } from './components/tabla-resultados/tablaResultados.component';
import { PanelBusquedaEstadisticaComponent } from './components/panel-busquedaPlana/panelBusquedaEstadistica.component';
import { Component, inject, signal, viewChild } from '@angular/core';
import { BusquedaEstadisticaFacade } from './facades/busquedaEstadistica.facade';
import { ActionSidebarComponent, SidebarAction } from '../../../shared/components/Action-siderbar/action-siderbar.component';
import { TablaAnidadaComponent } from './components/tabla-anidada/tablaAnidada.component';
import { CatalogosFacade } from '../../apelaciones/busqueda-apelaciones/facades/catalogos.facade';
import { TableRow, ChartSlice } from './models/estadisticas';

@Component({
  selector: 'app-estadisticas-plana',
  standalone: true,
  imports: [PanelBusquedaEstadisticaComponent, TablaResultadosComponent, GraficaTotalesComponent, ActionSidebarComponent, TablaAnidadaComponent],
  templateUrl: './estadisticasPlana.component.html',
})
export class EstadisticasPlanaComponent {

  private readonly Catalogo = inject(CatalogosFacade);
  readonly buscarEstadisticas = inject(BusquedaEstadisticaFacade);
  graficaRef = viewChild<GraficaTotalesComponent>('graficaRef');

  vistaActiva = signal<'resultados' | 'grafica'>('resultados');
  filaActiva = signal<TableRow | null>(null);

  // estadisticas-plana.component.ts
onFilaSeleccionada(row: TableRow): void {
  if (row.chartData) {
    this.buscarEstadisticas.chartActivo.set({ data: row.chartData, title: row.chartTitle ?? '' });
  }
}

onCeldaSeleccionada(event: { data: ChartSlice[]; title: string }): void {
  this.buscarEstadisticas.chartActivo.set(event);
}

    ngOnInit(): void {
      this.Catalogo.cargar();
  }

  get sidebarActions(): SidebarAction[] {
      const buscando   = this.buscarEstadisticas.buscando();
      const exportando = this.buscarEstadisticas.exportando();
      const ocupado = buscando || exportando;

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
      id:      'exportar',
      label:   'Exportar',
      icon:    'exportar',
      loading:  exportando,
      disabled: ocupado,
    },
          {
        id:       'limpiar',
        label:    'Limpiar',
        icon:     'limpiar',
        disabled:  ocupado,
      },
                {
        id:       'resultado',
        label:    'Resultado',
        icon:     'resultado',
        disabled: ocupado,
      },
                {
        id:       'grafica',
        label:    'Grafica',
        icon:     'grafica',
        disabled:  ocupado,
      },
  ];
    }
// estadisticas-plana.component.ts
onAction(id: string): void {
  const acciones: Record<string, () => void> = {
    buscar:   () => this.buscarEstadisticas.buscarEstadistica(),
    exportar: async () => {
      const imagen = await this.graficaRef()?.getImageBase64() ?? null;
      this.buscarEstadisticas.exportarExcel(imagen);
    },
    limpiar: () => this.buscarEstadisticas.limpiar(),
    resultado: () => this.vistaActiva.set('resultados'),
    grafica:    () => this.vistaActiva.set('grafica'),
  };
  acciones[id]?.();
}

}

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActionSidebarComponent, SidebarAction } from '../../shared/components/action-sidebar/action-sidebar.component';
import { PanelBusquedaTurnosComponent } from './components/panel-busqueda/panelBusqueda.component';
import { PanelResultadosTurnosComponent } from './components/panel-resultados/panelResultados.component';
import { TurnosFacade, TurnosPerfilTipo } from './facades/turnos.facade';
import { SessionStateService } from '../../features/permisos/services/session-state.service';
import { CatalogosFacade } from '../apelaciones/busqueda-apelaciones/facades/catalogos.facade';

@Component({
  selector: 'app-turnos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ActionSidebarComponent,
    PanelBusquedaTurnosComponent,
    PanelResultadosTurnosComponent,
  ],
  templateUrl: './turnos.component.html',
})
export class TurnosComponent implements OnInit {
  readonly facade = inject(TurnosFacade);
  private readonly sessionState = inject(SessionStateService);
  private readonly catalogosFacade = inject(CatalogosFacade);

  get sidebarActions(): SidebarAction[] {
    const buscando = this.facade.buscando();
    const exportando = this.facade.exportando();
    const importando = this.facade.importando();
    const esComun = this.facade.perfilTipo() === 'comun';
    const accionLabel = esComun ? 'Exportar' : 'Importar';
    const accionId = esComun ? 'exportar' : 'importar';
    const accionLoading = esComun ? exportando : importando;

    return [
      {
        id: 'buscar',
        label: 'Buscar',
        icon: 'buscar',
        primary: true,
        loading: buscando,
        disabled: buscando || exportando || importando,
      },
      {
        id: 'limpiar',
        label: 'Limpiar',
        icon: 'limpiar',
        disabled: buscando || exportando || importando,
      },
      {
        id: accionId,
        label: accionLabel,
        icon: 'turnar',
        disabled: !this.facade.haySeleccion() || buscando || exportando || importando,
        loading: accionLoading,
      },
    ];
  }

  onAction(id: string): void {
    const acciones: Record<string, () => void> = {
      buscar: () => this.facade.buscar(),
      limpiar: () => this.facade.limpiar(),
      exportar: () => this.facade.exportar(),
      importar: () => this.facade.importar(),
    };
    acciones[id]?.();
  }

  ngOnInit(): void {
    this.catalogosFacade.cargar();
    const perfil = this.sessionState.perfilInfo()?.descripcion ?? '';
    if (perfil.toLowerCase().includes('oficialía común') || perfil.toLowerCase().includes('comun')) {
      this.facade.perfilTipo.set('comun');
    } else {
      this.facade.perfilTipo.set('oficialia');
    }
    this.facade.limpiar();
  }
}

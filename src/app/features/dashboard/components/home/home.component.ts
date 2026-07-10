import { ActionCardComponent } from './../action-card/action-card.component';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SessionStateService } from '../../../permisos/services/session-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private sessionState = inject(SessionStateService);

  private perfilDescripcion = computed(() => this.sessionState.perfilInfo()?.descripcion ?? '');

  readonly tituloTurnos = computed(() => {
    const desc = this.perfilDescripcion().toLowerCase();
    return desc.includes('común') || desc.includes('comun')
      ? 'Exportación de Tocas'
      : 'Importación de Tocas';
  });

  readonly descripcionTurnos = computed(() => {
    const desc = this.perfilDescripcion().toLowerCase();
    return desc.includes('común') || desc.includes('comun')
      ? 'Exporte las apelaciones turnadas a la sala correspondiente.'
      : 'Importe las apelaciones turnadas a la sala correspondiente.';
  });

  private existePantalla(ruta: string): boolean {
    return this.sessionState
      .modulosPantallas()
      .some((m) => m.pantallas.some((p) => p.descripcion === ruta));
  }

  tieneApelaciones = computed(() => this.existePantalla('/capturaApelacion'));
  tieneBuscadorPlano = computed(() => this.existePantalla('/buscadorPlano'));
  tieneBuscadorHistorico = computed(() => this.existePantalla('/buscadorHistorico'));
  tieneEstadisticas = computed(() => this.existePantalla('/estadisticas'));
  tieneTurnos = computed(() => this.existePantalla('/turnos'));
  tieneRecibirToca = computed(() => this.existePantalla('/recibirtoca'));
  tieneTurnarToca = computed(() => this.existePantalla('/turnarToca'));
  tieneHistorial = computed(() => this.existePantalla('/historial'));
}

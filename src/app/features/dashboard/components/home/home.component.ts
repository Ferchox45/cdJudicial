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

  private existePantalla(ruta: string): boolean {
    return this.sessionState.modulosPantallas().some(m =>
      m.pantallas.some(p => p.descripcion === ruta)
    );
  }

  tieneApelaciones = computed(() => this.existePantalla('/capturaApelacion'));
  tieneBuscadorPlano = computed(() => this.existePantalla('/buscadorPlano'));
  tieneBuscadorHistorico = computed(() => this.existePantalla('/buscadorHistorico'));
  tieneEstadisticas = computed(() => this.existePantalla('/estadisticas'));
  tieneTurnos = computed(() => this.existePantalla('/turnos'));
  tieneRecibirToca = computed(() => this.existePantalla('/recibir'));
  tieneTurnarToca = computed(() => this.existePantalla('/turnar'));
  tieneHistorial = computed(() => this.existePantalla('/historial'));
}

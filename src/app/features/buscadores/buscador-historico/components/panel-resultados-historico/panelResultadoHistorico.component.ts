// panel-resultados-historico.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel-resultados-historico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panelResultadoHistorico.component.html',
})
export class PanelResultadosHistoricoComponent {
  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }
}

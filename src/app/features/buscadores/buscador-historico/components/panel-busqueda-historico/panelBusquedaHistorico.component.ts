// panel-busqueda-historico.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel-busqueda-historico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panelBusquedaHistorico.component.html',
})
export class PanelBusquedaHistoricoComponent {
  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }
}

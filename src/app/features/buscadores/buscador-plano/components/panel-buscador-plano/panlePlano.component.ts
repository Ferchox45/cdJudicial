import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel-busqueda-plano',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panelPlano.component.html',
})
export class PanelBusquedaPlanoComponent {
  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }
}

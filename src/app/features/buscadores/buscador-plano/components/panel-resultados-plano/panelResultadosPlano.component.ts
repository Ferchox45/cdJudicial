import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel-resultados-plano',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panelResultadosPlano.component.html',
})
export class PanelResultadosPlanoComponent {
  abierto = true;
  toggle(): void { this.abierto = !this.abierto; }
}

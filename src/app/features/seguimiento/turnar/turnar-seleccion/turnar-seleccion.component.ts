import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnarFacade } from '../../facades/turnar.facade';

@Component({
  selector: 'app-turnar-seleccion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnar-seleccion.component.html',
})
export class TurnarSeleccionComponent {
  readonly facade = inject(TurnarFacade);
}

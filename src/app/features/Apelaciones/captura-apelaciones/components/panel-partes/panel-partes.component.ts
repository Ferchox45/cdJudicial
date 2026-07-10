import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Parte } from '../../models/busqueda-rap.model';
import { CatalogoItem } from '../../../../../core/models/catalogo-global.model';
@Component({
  selector: 'app-panel-partes',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-partes.component.html',
})
export class PanelPartesComponent {
  readonly partes = input<Parte[]>([]);
  readonly parteForm = input.required<FormGroup>();
  readonly mostrarFormParte = input(false);
  readonly sexos = input<CatalogoItem[]>([]);
  readonly tiposPartes = input<CatalogoItem[]>([]);
  readonly bloquearBtn = input(true);

  readonly toggleMenorEvt = output<Parte>();
  readonly seleccionarEvt = output<Parte>();
  readonly agregarParteEvt = output<void>();
  readonly guardarParteEvt = output<void>();
  readonly cancelarParteEvt = output<void>();
}

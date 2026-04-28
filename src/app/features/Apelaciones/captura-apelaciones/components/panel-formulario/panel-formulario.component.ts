import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CatalogoItem } from '../../../../../core/models';
@Component({
  selector: 'app-panel-identificacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-formulario.component.html',
})
export class PanelIdentificacionComponent {
  @Input() form!: FormGroup;
  @Input() folioTentativo = '';
  @Input() cargando = false;
  @Input() buscando = false;
  @Input() busquedaExitosa = false;
  @Input() esIndigena = false;
  @Input() abierto = true;
  @Input() materias: CatalogoItem[] = [];
  @Input() apelaciones: CatalogoItem[] = [];
  @Input() tiposApelaciones: CatalogoItem[] = [];
  @Input() tiposEscritos: CatalogoItem[] = [];
  @Input() juzgados: CatalogoItem[] = [];
  @Input() magistrados: CatalogoItem[] = [];
  @Input() municipios: CatalogoItem[] = [];
  @Input() localidades: CatalogoItem[] = [];
  @Input() etnias: CatalogoItem[] = [];
  @Output() toggleEvt = new EventEmitter<void>();
  @Output() buscarEvt = new EventEmitter<void>();
}

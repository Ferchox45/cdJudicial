import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CatalogoItem} from '../../models/catalogo-apelaciones.model';
import { Parte } from '../../models/busqueda-rap.model';
@Component({
  selector: 'app-panel-partes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./panel.partes.component.html",
})
export class PanelPartesComponent {
  // ── Inputs ────────────────────────────────────────────────
  @Input() partes: Parte[] = [];
  @Input() parteForm!: FormGroup;
  @Input() mostrarFormParte = false;
  @Input() sexos: CatalogoItem[] = [];
  @Input() tiposPartes: CatalogoItem[] = [];
  @Input() bloquearBtn = true;

  // ── Outputs ───────────────────────────────────────────────
  @Output() toggleMenorEvt    = new EventEmitter<Parte>();
  @Output() seleccionarEvt    = new EventEmitter<Parte>();
  @Output() agregarParteEvt   = new EventEmitter<void>();
  @Output() guardarParteEvt   = new EventEmitter<void>();
  @Output() cancelarParteEvt  = new EventEmitter<void>();
}

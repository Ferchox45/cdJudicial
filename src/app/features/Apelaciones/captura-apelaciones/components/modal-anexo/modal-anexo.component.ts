import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-anexos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './modal-anexo.component.html',
})
export class ModalAnexosComponent {
  @Input() visible = false;
  @Input() folio   = '';
  @Input() sala  = '';
  @Output() continuar = new EventEmitter<void>();
  @Output() terminar  = new EventEmitter<void>();
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-anexos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-anexo.component.html',
})
export class ModalAnexosComponent {
  @Input() visible = false;
  @Input() folio   = '';
  @Output() continuar = new EventEmitter<void>();
  @Output() terminar  = new EventEmitter<void>();
}

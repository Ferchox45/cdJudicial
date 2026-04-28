import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-aviso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-aviso.component.html',
})
export class ModalAvisoComponent {
  @Input() visible = false;
  @Input() mensaje = '';
  @Input() tipo: 'success' | 'error' = 'error';
  @Output() cerrar = new EventEmitter<void>();
}

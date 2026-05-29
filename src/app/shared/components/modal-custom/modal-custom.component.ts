import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './modal-custom.component.html'
})
export class CustomModalComponent {
  // ── INPUTS: Lo que recibe el modal desde el padre ──
  @Input() show = false;
  @Input() type: 'info' | 'error' | 'success' = 'info';
  @Input() title = '';
  @Input() message = '';

  // Textos personalizables para los botones
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';

  // ── OUTPUTS: Los eventos que el modal avisa al padre ──
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // Métodos internos que emiten los eventos
  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

let modalIdCounter = 0;

@Component({
  selector: 'app-custom-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './modal-custom.component.html'
})
export class CustomModalComponent {
  @Input() show = false;
  @Input() type: 'info' | 'error' | 'success' = 'info';
  @Input() title = '';
  @Input() message = '';

  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  readonly modalId = `modal-${++modalIdCounter}`;

  get role(): string {
    return this.type === 'error' || this.type === 'success' ? 'alert' : 'dialog';
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

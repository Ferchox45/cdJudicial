import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
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
  readonly show = input(false);
  readonly type = input<'info' | 'error' | 'success'>('info');
  readonly title = input('');
  readonly message = input('');

  readonly confirmText = input('Confirmar');
  readonly cancelText = input('Cancelar');

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  readonly modalId = `modal-${++modalIdCounter}`;

  readonly role = computed(() =>
    this.type() === 'error' || this.type() === 'success' ? 'alert' : 'dialog'
  );

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

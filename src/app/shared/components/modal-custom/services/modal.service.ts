import { Injectable, signal } from '@angular/core';

export interface ModalConfig {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  confirmText?: string;
  cancelText?: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private _config = signal<ModalConfig | null>(null);

  readonly config = this._config.asReadonly();
  readonly isOpen = signal(false);

  open(config: ModalConfig): void {
    this._config.set(config);
    this.isOpen.set(true);
  }

  // Shortcuts de conveniencia
  error(title: string, message: string)   { this.open({ title, message, type: 'error' }); }
  success(title: string, message: string) { this.open({ title, message, type: 'success' }); }
  info(title: string, message: string, confirmText?: string, cancelText?: string) {
    this.open({ title, message, type: 'info', confirmText, cancelText });
  }

  close(): void { this.isOpen.set(false); }
}

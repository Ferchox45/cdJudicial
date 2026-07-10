import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

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

  private confirmResult = new Subject<boolean>();

  open(config: ModalConfig): void {
    this._config.set(config);
    this.isOpen.set(true);
  }

  error(title: string, message: string) {
    this.open({ title, message, type: 'error' });
  }
  success(title: string, message: string) {
    this.open({ title, message, type: 'success' });
  }
  info(title: string, message: string, confirmText?: string, cancelText?: string) {
    this.open({ title, message, type: 'info', confirmText, cancelText });
  }

  confirm(
    title: string,
    message: string,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
  ): Observable<boolean> {
    this.open({ title, message, type: 'info', confirmText, cancelText });
    return this.confirmResult.asObservable();
  }

  confirmar(): void {
    this.confirmResult.next(true);
    this.confirmResult = new Subject<boolean>();
    this.isOpen.set(false);
  }

  cancelar(): void {
    this.confirmResult.next(false);
    this.confirmResult = new Subject<boolean>();
    this.isOpen.set(false);
  }

  close(): void {
    this.isOpen.set(false);
  }
}

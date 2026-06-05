import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certificacion-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './certificacion-modal.component.html',
})
export class CertificacionModalComponent {
  readonly visible = input(false);
  readonly base64 = input('');
  readonly close = output<void>();

  protected textoCertificacion = '';

  constructor() {
    effect(() => {
      const b64 = this.base64();
      if (b64) {
        const byteChars = atob(b64);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNums[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNums);
        this.textoCertificacion = new TextDecoder('utf-8').decode(byteArray);
      } else {
        this.textoCertificacion = '';
      }
    });
  }

  protected imprimir(): void {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificación</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            padding: 2cm;
            white-space: pre-wrap;
            line-height: 1.5;
            margin: 0;
          }
          @media print {
            body { padding: 1.5cm; }
          }
        </style>
      </head>
      <body><pre style="font-family:inherit;font-size:inherit;margin:0;white-space:pre-wrap">${this.textoCertificacion}</pre></body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }
}

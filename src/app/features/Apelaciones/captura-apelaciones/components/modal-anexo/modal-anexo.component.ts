import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-anexos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './modal-anexo.component.html',
})
export class ModalAnexosComponent {
  readonly visible = input(false);
  readonly folio   = input('');
  readonly sala    = input('');
  readonly continuar = output<void>();
  readonly terminar  = output<void>();
}

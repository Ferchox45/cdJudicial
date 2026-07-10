import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalService } from './shared/components/modal-custom/services/modal.service';
import { CustomModalComponent } from './shared/components/modal-custom/modal-custom.component';
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, CustomModalComponent],
  templateUrl: './app.html',
})
export class AppComponent {
  modalService = inject(ModalService);
}

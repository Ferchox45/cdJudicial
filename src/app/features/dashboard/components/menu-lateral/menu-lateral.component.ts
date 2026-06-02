import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-menulateral',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-lateral.component.html',
  imports: [RouterLink, RouterLinkActive],
})

export class MenulateralComponent {
  private auth = inject(AuthService);

  isOpen = input(false);
  closeMenu = output<void>();

  logout() {
    this.auth.logout().subscribe();
  }
}

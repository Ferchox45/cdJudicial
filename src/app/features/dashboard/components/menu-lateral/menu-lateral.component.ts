import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-menulateral',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-lateral.component.html',
  imports: [RouterLink, RouterLinkActive, A11yModule],
})

export class MenulateralComponent {
  private auth = inject(AuthService);

  expanded = input(false);
  isOpen = input(false);
  closeMenu = output<void>();

  protected readonly isExpandedOrOpen = computed(() => this.isOpen() || this.expanded());

  logout() {
    this.auth.logout().subscribe();
  }
}

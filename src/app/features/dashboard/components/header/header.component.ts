import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { BreadcrumbService } from '../../data/breadcrumb.service';
import { RouterModule } from '@angular/router';
import { SessionStateService } from '../../../permisos/services/session-state.service';
import { AuthService } from '../../../auth/services/auth.service';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-main-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
  templateUrl: './header.component.html',
})
export class MainHeaderComponent {
  private breadcrumbService = inject(BreadcrumbService);
  private sessionState = inject(SessionStateService);
  private authService = inject(AuthService);

  toggleMobileMenu = output<void>();
  toggleSidebar = output<void>();
  sidebarExpanded = input(false);

  breadcrumbs = this.breadcrumbService.breadcrumbs;

  userName = computed(() => this.authService.userNombre() ?? 'USUARIO');
  userFoto = computed(() => this.authService.userFoto());
  area = this.sessionState.areaInfo;
  perfil = this.sessionState.perfilInfo;
}

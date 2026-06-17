import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SessionStateService } from '../../../permisos/services/session-state.service';
import { AuthService } from '../../../auth/services/auth.service';
import { BreadcrumbService } from '../../data/breadcrumb.service';

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
  private router = inject(Router);

  perfilDropdownAbierto = signal(false);

  togglePerfilDropdown(): void {
    this.perfilDropdownAbierto.update(v => !v);
  }

  cerrarPerfilDropdown(): void {
    this.perfilDropdownAbierto.set(false);
  }

  irASeleccionPerfil(): void {
    this.cerrarPerfilDropdown();
    this.router.navigate(['/seleccion-permisos']);
  }

  toggleMobileMenu = output<void>();
  toggleSidebar = output<void>();
  sidebarExpanded = input(false);

  breadcrumbs = this.breadcrumbService.breadcrumbs;

  userName = computed(() => this.authService.userNombre() ?? 'USUARIO');
  photo = this.authService.userFoto;
  area = this.sessionState.areaInfo;
  perfil = this.sessionState.perfilInfo;

  fotoError = signal(false);

  fotoParaMostrar = computed(() => {
    const foto = this.photo();
    return foto && !this.fotoError() ? foto : null;
  });

  onImgError(): void {
    this.fotoError.set(true);
  }

  constructor() {
    effect(() => {
      this.photo();
      this.fotoError.set(false);
    });
  }
}

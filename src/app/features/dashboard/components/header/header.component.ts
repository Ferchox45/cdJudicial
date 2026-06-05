import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { BreadcrumbService } from '../../data/breadcrumb.service';
import { RouterModule } from '@angular/router';

// 1. Creamos una interfaz para definir cómo se ve un elemento del breadcrumb
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

  toggleMobileMenu = output<void>();
  toggleSidebar = output<void>();
  sidebarExpanded = input(false);
  // Usamos el signal del servicio directamente
  breadcrumbs = this.breadcrumbService.breadcrumbs;

  userName = input('FERNANDO CONTRERAS');
  area = input('Poder Judicial del estado de Oaxaca');
  perfil = input('Oficialía Salas');
  subArea = input('Secretaría 1');

}

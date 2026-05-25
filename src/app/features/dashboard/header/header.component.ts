import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';

// 1. Creamos una interfaz para definir cómo se ve un elemento del breadcrumb
export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
})
export class MainHeaderComponent {

private breadcrumbService = inject(BreadcrumbService);

  // Usamos el signal del servicio directamente
  breadcrumbs = this.breadcrumbService.breadcrumbs;

  userName = input('FERNANDO CONTRERAS');
  area = input('Poder Judicial del estado de Oaxaca');
  perfil = input('Oficialía Salas');
  subArea = input('Secretaría 1');

}

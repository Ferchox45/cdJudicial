import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { SessionStateService } from '../../../permisos/services/session-state.service';
import { Pantalla } from '../../../permisos/models/permisos.types';

interface MenuItem {
  ruta: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-menulateral',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-lateral.component.html',
  imports: [RouterLink, RouterLinkActive, A11yModule],
})
export class MenulateralComponent {
  private auth = inject(AuthService);
  private sessionState = inject(SessionStateService);

  expanded = input(false);
  isOpen = input(false);
  closeMenu = output<void>();

  protected readonly isExpandedOrOpen = computed(() => this.isOpen() || this.expanded());

  protected readonly menuItems = computed<MenuItem[]>(() => {
    const modulos = this.sessionState.modulosPantallas();
    const items: MenuItem[] = [];
    for (const modulo of modulos) {
      for (const pantalla of modulo.pantallas) {
        if (pantalla.visibleMenu && pantalla.descripcion) {
          items.push({
            ruta: '/' + pantalla.descripcion,
            label: pantalla.nombre,
            icon: this.getIcon(pantalla.descripcion),
          });
        }
      }
    }
    return items;
  });

  private getIcon(descripcion: string): string {
    if (descripcion.includes('inicio')) return 'home';
    if (descripcion.includes('crear')) return 'file';
    if (descripcion.includes('buscar') || descripcion.includes('historico')) return 'search';
    if (descripcion.includes('estadistica') || descripcion.includes('reporte')) return 'chart';
    if (descripcion.includes('turno')) return 'transfer';
    return 'default';
  }

  logout() {
    this.auth.logout().subscribe();
  }
}

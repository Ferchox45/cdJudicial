import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { SessionStateService } from '../../../permisos/services/session-state.service';

interface MenuItem {
  ruta: string;
  label: string;
  icon: string;
}

interface MenuGroup {
  nombre: string;
  icono: string;
  items: MenuItem[];
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
  protected readonly gruposAbiertos = signal(new Set<string>());

  protected toggleGrupo(nombre: string): void {
    this.gruposAbiertos.update(s => {
      const nuevo = new Set(s);
      if (nuevo.has(nombre)) nuevo.delete(nombre);
      else nuevo.add(nombre);
      return nuevo;
    });
  }

  protected readonly menuItems = computed<MenuGroup[]>(() => {
    const modulos = this.sessionState.modulosPantallas();
    const groups: MenuGroup[] = [];
    for (const modulo of modulos) {
      const items: MenuItem[] = [];
      for (const pantalla of modulo.pantallas) {
        if (pantalla.visibleMenu && pantalla.descripcion) {
          items.push({
            ruta: '/' + pantalla.descripcion,
            label: pantalla.nombre,
            icon: this.getIcon(pantalla.descripcion),
          });
        }
      }
      if (items.length > 0) {
        groups.push({
          nombre: modulo.nombre,
          icono: this.getModuloIcon(modulo.nombre),
          items,
        });
      }
    }
    return groups;
  });

  private getModuloIcon(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('oficialia')) return 'building';
    if (n.includes('seguimiento') || n.includes('turno')) return 'transfer';
    if (n.includes('captura')) return 'file';
    if (n.includes('busca')) return 'search';
    if (n.includes('estadistica')) return 'chart';
    if (n.includes('historial') || n.includes('historico')) return 'history';
    return 'gavel';
  }

  private getIcon(descripcion: string): string {
    if (descripcion.includes('inicio')) return 'home';
    if (descripcion.includes('capturaApelacion')) return 'file';
    if (descripcion.includes('buscadorHistorico')) return 'history';
    if (descripcion.includes('buscadorPlano')) return 'search';
    if (descripcion.includes('estadisticas')) return 'chart';
    if (descripcion.includes('turnos')) return 'transfer';
    if (descripcion.includes('turnar')) return 'transfer-vertical';
    if (descripcion.includes('recibir')) return 'inbox';
    if (descripcion.includes('historial'))  return 'history';
    return 'default';
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
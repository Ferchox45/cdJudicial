import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { PermisosService } from '../../data/permisos.service';
import { SessionStateService } from '../../services/session-state.service';
import {
  AreaUsuarioSistema,
  PerfilUsuario,
  SubArea,
} from '../../models/permisos.types';

type Paso = 'areas' | 'perfiles' | 'completado';

@Component({
  selector: 'app-seleccion-permisos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './seleccion-permisos.component.html',
})
export class SeleccionPermisosComponent {
  private permisosService = inject(PermisosService);
  private sessionState = inject(SessionStateService);
  private router = inject(Router);

  paso = signal<Paso>('areas');
  areas = signal<AreaUsuarioSistema[]>([]);
  areaSeleccionada = signal<AreaUsuarioSistema | null>(null);
  cargandoAreas = signal(false);
  errorAreas = signal('');

  perfiles = signal<PerfilUsuario[]>([]);
  perfilSeleccionado = signal<PerfilUsuario | null>(null);
  cargandoPerfil = signal(false);
  errorPerfil = signal('');

  subareas = signal<SubArea[]>([]);
  subareaSeleccionada = signal<SubArea | null>(null);

  cargandoModulos = signal(false);

  protected puedeIngresar = computed(() => this.perfilSeleccionado() !== null);

  constructor() {
    this.cargarAreas();
  }

  protected cargarAreas(): void {
    this.cargandoAreas.set(true);
    this.errorAreas.set('');
    this.permisosService.getAreas().subscribe({
      next: (areas) => {
        this.areas.set(areas);
        this.cargandoAreas.set(false);
      },
      error: () => {
        this.errorAreas.set('Error al cargar las áreas. Intente de nuevo.');
        this.cargandoAreas.set(false);
      },
    });
  }

  seleccionarArea(area: AreaUsuarioSistema): void {
    this.areaSeleccionada.set(area);
    this.cargandoPerfil.set(true);
    this.errorPerfil.set('');

    this.permisosService
      .ingresar({ idArea: area.idArea, idAreaSistema: area.idAreaSistema })
      .subscribe({
        next: (config) => {
          this.sessionState.setArea({
            idArea: area.idArea,
            idAreaSistema: area.idAreaSistema,
            area: area.area,
          });
          this.sessionState.setAreaSistemaUsuario(config.idAreaSistemaUsuario);
          this.perfiles.set(config.perfiles);
          this.subareas.set(config.subareas);
          this.subareaSeleccionada.set(null);
          this.perfilSeleccionado.set(null);
          this.cargandoPerfil.set(false);
          this.paso.set('perfiles');
        },
        error: () => {
          this.errorPerfil.set('Error al ingresar al área. Intente de nuevo.');
          this.cargandoPerfil.set(false);
        },
      });
  }

  seleccionarSubarea(subarea: SubArea | null): void {
    this.subareaSeleccionada.set(subarea);
  }

  protected onSubareaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const idx = parseInt(select.value, 10);
    this.subareaSeleccionada.set(idx >= 0 ? this.subareas()[idx] : null);
  }

  seleccionarPerfil(perfil: PerfilUsuario): void {
    this.perfilSeleccionado.set(
      this.perfilSeleccionado()?.idSistemaPerfil === perfil.idSistemaPerfil ? null : perfil,
    );
  }

  protected onPerfilChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const idx = parseInt(select.value, 10);
    this.perfilSeleccionado.set(idx >= 0 ? this.perfiles()[idx] : null);
  }

  ingresar(): void {
    const perfil = this.perfilSeleccionado();
    if (!perfil) return;

    this.sessionState.setPerfil({
      idSistemaPerfil: perfil.idSistemaPerfil,
      descripcion: perfil.descripcion,
    });

    this.cargandoModulos.set(true);
    this.permisosService
      .getModulosPantallas({
        idAreaSistemaUsuario: this.sessionState.idAreaSistemaUsuario()!,
        idPerfilUsuario: perfil.idSistemaPerfil,
      })
      .subscribe({
        next: (modulos) => {
          this.sessionState.setModulosPantallas(modulos);
          this.cargandoModulos.set(false);
          this.sessionState.completar();
          this.paso.set('completado');
          setTimeout(() => this.router.navigate(['/inicio']), 500);
        },
        error: () => {
          this.errorPerfil.set('Error al cargar los módulos. Intente de nuevo.');
          this.cargandoModulos.set(false);
        },
      });
  }
}

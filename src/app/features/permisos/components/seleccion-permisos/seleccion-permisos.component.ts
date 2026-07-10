import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { PermisosService } from '../../data/permisos.service';
import { SessionStateService } from '../../services/session-state.service';
import { Area, PerfilUsuario, SubArea } from '../../models/permisos.types';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

type Paso = 'areas' | 'perfiles' | 'completado';

@Component({
  selector: 'app-seleccion-permisos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpinnerComponent],
  templateUrl: './seleccion-permisos.component.html',
})
export class SeleccionPermisosComponent {
  private permisosService = inject(PermisosService);
  private sessionState = inject(SessionStateService);
  private auth = inject(AuthService);
  private router = inject(Router);

  paso = signal<Paso>('areas');

  areas = signal<Area[]>([]);
  areaSeleccionada = signal<Area | null>(null);
  cargandoAreas = signal(false);
  errorAreas = signal('');

  perfiles = signal<PerfilUsuario[]>([]);
  perfilSeleccionado = signal<PerfilUsuario | null>(null);
  subareas = signal<SubArea[]>([]);
  subareaSeleccionada = signal<number | null>(null);
  cargandoPerfil = signal(false);
  errorPerfil = signal('');

  cargandoModulos = signal(false);

  protected puedeIngresar = computed(() => this.perfilSeleccionado() !== null);

  constructor() {
    this.cargarAreas();
  }

  private cargarAreas(): void {
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

  protected onAreaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const idx = parseInt(select.value, 10);
    const area = idx >= 0 ? this.areas()[idx] : null;
    this.areaSeleccionada.set(area);
    if (area) {
      this.cargarPerfiles(area);
    }
  }

  private cargarPerfiles(area: Area): void {
    this.cargandoPerfil.set(true);
    this.errorPerfil.set('');
    this.perfiles.set([]);
    this.subareas.set([]);
    this.subareaSeleccionada.set(null);
    this.perfilSeleccionado.set(null);

    this.permisosService.ingresar(area.idArea, area.idAreaSistema).subscribe({
      next: (config) => {
        this.sessionState.setAreaSistemaUsuario(config.idAreaSistemaUsuario);
        this.sessionState.setArea({
          idArea: area.idArea,
          idAreaSistema: area.idAreaSistema,
          area: area.area,
        });
        this.sessionState.setIdSala(area.idArea);
        this.sessionState.setSalaInfo({ idSala: area.idArea, descripcion: area.area });
        this.sessionState.setSalasDisponibles([]);
        this.perfiles.set(config.perfiles);
        this.subareas.set(config.subareas);
        this.cargandoPerfil.set(false);
        this.paso.set('perfiles');
      },
      error: () => {
        this.errorPerfil.set('Error al cargar los perfiles. Intente de nuevo.');
        this.cargandoPerfil.set(false);
      },
    });
  }

  protected onPerfilChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const idx = parseInt(select.value, 10);
    this.perfilSeleccionado.set(idx >= 0 ? this.perfiles()[idx] : null);
  }

  protected onSubareaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const idx = parseInt(select.value, 10);
    this.subareaSeleccionada.set(idx >= 0 ? this.subareas()[idx].idSubArea : null);
  }

  protected salir(): void {
    this.auth.logout().subscribe();
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

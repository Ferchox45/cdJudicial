import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { PermisosService } from '../../data/permisos.service';
import { SessionStateService } from '../../services/session-state.service';
import { PerfilUsuario, Sala } from '../../models/permisos.types';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

type Paso = 'perfiles' | 'completado';

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

  paso = signal<Paso>('perfiles');

  perfiles = signal<PerfilUsuario[]>([]);
  perfilSeleccionado = signal<PerfilUsuario | null>(null);
  cargandoPerfil = signal(false);
  errorPerfil = signal('');

  salas = signal<Sala[]>([]);
  salaSeleccionada = signal<number | null>(null);
  cargandoModulos = signal(false);

  protected puedeIngresar = computed(() => this.perfilSeleccionado() !== null);

  protected mostrarSelectorSalas = computed(() =>
    this.perfilSeleccionado()?.idSistemaPerfil !== 2,
  );

  constructor() {
    this.cargarPerfiles();
  }

  private cargarPerfiles(): void {
    this.cargandoPerfil.set(true);
    this.errorPerfil.set('');

    this.permisosService.ingresar().subscribe({
      next: (config) => {
        this.sessionState.setAreaSistemaUsuario(config.idAreaSistemaUsuario);
        this.perfiles.set(config.perfiles);
        this.salas.set(config.salas);
        this.cargandoPerfil.set(false);
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
    this.salaSeleccionada.set(null);
  }

  protected onSalaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const idx = parseInt(select.value, 10);
    this.salaSeleccionada.set(idx >= 0 ? this.salas()[idx].idSala : null);
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

    const salaId = this.salaSeleccionada();
    this.sessionState.setIdSala(salaId);
    this.sessionState.setSalasDisponibles(this.salas());
    if (salaId != null) {
      const sala = this.salas().find(s => s.idSala === salaId);
      if (sala) this.sessionState.setSalaInfo({ idSala: sala.idSala, descripcion: sala.descripcion });
    }

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

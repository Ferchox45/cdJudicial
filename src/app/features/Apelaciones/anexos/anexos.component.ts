import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnexoApiService } from './data/anexos.service';
import { CatalogoItem } from '../../../core/models/catalogo-global.model';
import { finalize } from 'rxjs/operators';
import { Anexo } from './models/anexo.model';
import { ApelacionContextService } from './data/apelacion-context.service';
import { ModalService } from '../../../shared/components/modal-custom/services/modal.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { SessionStateService } from '../../permisos/services/session-state.service';
import { OnUnsavedChanges } from '../../../shared/guards/on-unsaved-changes';

@Component({
  selector: 'app-anexos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './anexos.component.html',
})
export class AnexosComponent implements OnInit, OnUnsavedChanges {

  private apelacionService = inject(AnexoApiService);
  private contextoService  = inject(ApelacionContextService);
  private modalService     = inject(ModalService);
  private sessionState      = inject(SessionStateService);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly errorGuardado = signal<string | null>(null);
  readonly exitoGuardado = signal<string | null>(null);
  readonly anexosGuardados = signal(false);
  readonly readOnly = signal(false);

  folioTramite: string | null = null;
  sala: string | null = null;
  idApelacion: number | null = null;
  readonly tiposAnexo = signal<CatalogoItem[]>([]);
  readonly anexos = signal<Anexo[]>([]);

  nuevoAnexo = {
    idAnexo:    null as number | null,
    tipo:       '',
    cantidad:   1,
    tieneMonto: false,
    monto:      0,
    otroAnexo:  '',
  };

  get esOtro(): boolean {
    return this.nuevoAnexo.idAnexo === -1;
  }

  ngOnInit(): void {
    this.idApelacion = this.contextoService.apelacionId();
    this.folioTramite = this.contextoService.folioOficialia();
    this.sala = this.contextoService.sala();
    if (!this.idApelacion) {
      this.modalService.error('Error', 'No hay una apelación activa en memoria. Por favor, inicie desde la captura.');
      setTimeout(() => this.onBack(), 3000);
      return;
    }
    const previos = this.contextoService.anexosPrevios();
    if (previos.length > 0) {
      this.anexos.set(previos);
      this.readOnly.set(true);
    }
    this.cargarAnexos();
  }

cargarAnexos(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.apelacionService.getCatalogoAnexo().subscribe({
      next: (data) => {
        this.tiposAnexo.set(data.anexo);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los tipos de anexo.');
        this.cargando.set(false);
        setTimeout(() => {
          this.apelacionService.invalidarAnexos();
          this.cargarAnexos();
        }, 5000);
      }
    });
  }

  onTipoChange(id: number): void {
    if (id === -1) {
      this.nuevoAnexo.tipo = 'Otro Anexo';
    } else {
      const found = this.tiposAnexo().find(t => t.id === id);
      this.nuevoAnexo.tipo = found?.descripcion ?? '';
      this.nuevoAnexo.otroAnexo = '';
    }
  }

agregarAnexo(): void {
    if (!this.nuevoAnexo.idAnexo) {
      this.modalService.error('Error', 'Debes seleccionar un tipo de anexo.');
      return;
    }

    if (this.esOtro && (!this.nuevoAnexo.otroAnexo || this.nuevoAnexo.otroAnexo.trim() === '')) {
      this.modalService.error('Error', 'Debes especificar el nombre del nuevo anexo.');
      return;
    }

    const anexo: Anexo = {
      idAnexo:   this.nuevoAnexo.idAnexo,
      cantidad:  this.nuevoAnexo.cantidad,
      tipo:      this.esOtro ? this.nuevoAnexo.otroAnexo.trim() : this.nuevoAnexo.tipo,
      esValor:   this.nuevoAnexo.tieneMonto,
      monto:     this.nuevoAnexo.tieneMonto ? this.nuevoAnexo.monto : null,
      otroAnexo: this.esOtro ? this.nuevoAnexo.otroAnexo.trim() : '',
    };

    this.anexos.update(list => [...list, anexo]);
    this.nuevoAnexo = {
      idAnexo: null,
      tipo: '',
      cantidad: 1,
      tieneMonto: false,
      monto: 0,
      otroAnexo: '' };
  }

  eliminarAnexo(index: number): void {
    this.anexos.update(list => list.filter((_, i) => i !== index));
  }

  guardar(): void {
    if (!this.idApelacion) {
      this.modalService.error('Error crítico', 'Se perdió el ID de la apelación.');
      return;
    }
    if (!this.anexos().length) {
      this.modalService.info('Sin anexos', 'No has agregado ningún anexo para guardar.', 'Agregar anexos');
      return;
    }

    const payload = {
      idApelacion: this.idApelacion,
      anexos: this.anexos().map(a => {
        const anexoFormateado: any = {
          idAnexo:   a.idAnexo,
          cantidad:  a.cantidad,
          esValor:   a.esValor,
          monto:     a.esValor ? a.monto : null
        };

        if (a.idAnexo === -1) {
          anexoFormateado.otroAnexo = a.otroAnexo;
        }

        return anexoFormateado;
      }),
      idAreaSistemaUsuario: this.sessionState.idAreaSistemaUsuario() ?? undefined,
      idPantalla: this.sessionState.idPantalla() ?? undefined,
    };

    this.guardando.set(true);

    this.apelacionService.guardarAnexos(payload)
      .pipe(finalize(() => {
        this.guardando.set(false);
      }))
      .subscribe({
        next: () => {
          this.anexosGuardados.set(true);
          this.modalService.success('Guardado correctamente','Anexos guardados correctamente.');
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Error al guardar los anexos.';
          this.modalService.error('Error', msg);
        }
      });
  }

  recargar(): void {
    this.apelacionService.invalidarAnexos();
    this.cargarAnexos();
  }

  hasUnsavedChanges(): boolean {
    return this.anexos().length > 0 && !this.anexosGuardados();
  }

  onBack(): void {
    window.history.back();
  }
}

import { Component, OnInit, inject,  ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApelacionService } from '../../../core/services/apelaciones.service';
import { CatalogoItem, Anexo } from '../../../core/models';
import { finalize } from 'rxjs/operators';
import { ApelacionContextService } from '../../../core/services/apelacion-context.service';
import { ModalService } from '../../../shared/components/modal-custom/services/modal.service';

@Component({
  selector: 'app-anexos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anexos.component.html',
})
export class AnexosComponent implements OnInit {

  private apelacionService = inject(ApelacionService);
  private cdr              = inject(ChangeDetectorRef);
  private contextoService  = inject(ApelacionContextService);
  private modalService     = inject(ModalService);
  // ── Estado ─────────────────────────────────────────────────
  cargando = false;
  error: string | null = null;
  guardando = false;
  errorGuardado: string | null = null;
  exitoGuardado: string | null = null;
  anexosGuardados = false;


  // ── Datos ──────────────────────────────────────────────────
  folioTramite: string | null = null;
  sala: string | null = null;
  idApelacion: number | null = null;
  tiposAnexo:  CatalogoItem[] = [];
  anexos:      Anexo[]        = [];

  // ── Nuevo anexo (modelo del formulario) ────────────────────
  nuevoAnexo = {
    idAnexo:    0,
    tipo:       '',
    cantidad:   1,
    tieneMonto: false,
    monto:      0,
    otroAnexo:  '',
  };

  // ── Detecta si el tipo seleccionado es "OTRO" ──────────────
  get esOtro(): boolean {
    return this.nuevoAnexo.idAnexo === -1;
  }

  ngOnInit(): void {
    this.idApelacion = this.contextoService.apelacionId();
    this.folioTramite = this.contextoService.folioOficialia();
    this.sala = this.contextoService.sala();
    if (!this.idApelacion) {
      this.modalService.error('Error', 'No hay una apelación activa en memoria. Por favor, inicie desde la captura.');
      // Opcional: regresarlo a la pantalla anterior después de 3 segundos
      setTimeout(() => this.onBack(), 3000);
      return;
    }
    // 3. Si todo está bien, cargamos los catálogos
    this.cargarAnexos();
  }

  // ── Carga catálogo ─────────────────────────────────────────
cargarAnexos(): void {
    this.cargando = true;
    this.error    = null;

    this.apelacionService.getCatalogoAnexo().subscribe({
      next: (data) => {
        console.log('Tipos de anexo cargados:', data.anexo);
        this.tiposAnexo = data.anexo;
        this.cargando   = false;
        this.cdr.detectChanges();  // ← fuerza actualización
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.error    = 'No se pudieron cargar los tipos de anexo.';
        this.cargando = false;
        this.cdr.detectChanges();  // ← también aquí
        setTimeout(() => {
          this.apelacionService.invalidarAnexos();
          this.cargarAnexos();
        }, 5000);
      }
    });
  }

  // ── Sincroniza descripción cuando cambia el select ─────────
  onTipoChange(id: number): void {
    if (id === -1) {
      this.nuevoAnexo.tipo = 'Otro Anexo';
    } else {
      const found = this.tiposAnexo.find(t => t.id === id);
      this.nuevoAnexo.tipo = found?.descripcion ?? '';
      // Si no es OTRO, limpia el campo libre
      this.nuevoAnexo.otroAnexo = '';
    }
    console.log('Tipo seleccionado:', this.nuevoAnexo.tipo);
  }

  // ── Agrega anexo a la lista ────────────────────────────────
agregarAnexo(): void {
    if (!this.nuevoAnexo.idAnexo) {
      this.modalService.error('Error', 'Debes seleccionar un tipo de anexo.');
      return;
    }

    // Validación extra: Si es "Otro", el campo no puede estar vacío
    if (this.esOtro && (!this.nuevoAnexo.otroAnexo || this.nuevoAnexo.otroAnexo.trim() === '')) {
      this.modalService.error('Error', 'Debes especificar el nombre del nuevo anexo.');
      return;
    }

    const anexo: Anexo = {
      idAnexo:   this.nuevoAnexo.idAnexo,
      cantidad:  this.nuevoAnexo.cantidad,
      // Guardamos el texto escrito por el usuario en 'tipo' para que se vea bonito en la tabla
      tipo:      this.esOtro ? this.nuevoAnexo.otroAnexo.trim() : this.nuevoAnexo.tipo,
      esValor:   this.nuevoAnexo.tieneMonto,
      monto:     this.nuevoAnexo.tieneMonto ? this.nuevoAnexo.monto : null,
      otroAnexo: this.esOtro ? this.nuevoAnexo.otroAnexo.trim() : '',
    };

    console.log('Anexo agregado a la lista:', anexo);
    this.anexos.push(anexo);
    // Reset del formulario (incluyendo el ID)
    this.nuevoAnexo = { idAnexo: 0, tipo: '', cantidad: 1, tieneMonto: false, monto: 0, otroAnexo: '' };
  }

  eliminarAnexo(index: number): void {
    console.log('Eliminando anexo en índice:', index, this.anexos[index]);
    this.anexos.splice(index, 1);
  }

  // ── Guarda todos los anexos en el backend ──────────────────
// ── Guarda todos los anexos en el backend ──────────────────
  guardar(): void {
    if (!this.idApelacion) {
      this.modalService.error('Error crítico', 'Se perdió el ID de la apelación.');
      return;
    }
    if (!this.anexos.length) {
      this.modalService.info('Sin anexos', 'No has agregado ningún anexo para guardar.', 'Agregar anexos');
      return;
    }

    const payload = {
      idApelacion: this.idApelacion,
      anexos: this.anexos.map(a => {
        // 1. Creamos la estructura base (sin 'otroAnexo')
        const anexoFormateado: any = {
          idAnexo:   a.idAnexo,
          cantidad:  a.cantidad,
          esValor:   a.esValor,
          monto:     a.esValor ? a.monto : null
        };

        // 2. Si el idAnexo es -1, le inyectamos la propiedad 'otroAnexo'
        if (a.idAnexo === -1) {
          anexoFormateado.otroAnexo = a.otroAnexo;
        }

        return anexoFormateado;
      })
    };

    console.log('Payload guardar anexos:', payload);

    this.guardando = true;

    this.apelacionService.guardarAnexos(payload)
      .pipe(finalize(() => {
        setTimeout(() => this.guardando = false);
      }))
      .subscribe({
        next: () => {
          this.anexosGuardados = true;
          this.modalService.success('Guardado correctamente','Anexos guardados correctamente.');
        },
        error: (err) => {
          console.error('Error al guardar anexos:', err.error);
          const msg = err?.error?.message ?? 'Error al guardar los anexos.';
          this.modalService.error('Error', msg);
        }
      });
  }

  recargar(): void {
    this.apelacionService.invalidarAnexos();
    this.cargarAnexos();
  }
  onBack(): void {
    window.history.back();
  }
}

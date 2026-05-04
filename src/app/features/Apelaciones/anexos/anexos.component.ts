import { Component, OnInit, inject,  ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainHeaderComponent } from '../../../shared/components/header/header.component';
import { ApelacionService } from '../../../core/services/apelaciones.service';
import { CatalogoItem } from '../../../core/models';
import { finalize } from 'rxjs/operators';
import { ApelacionContextService } from '../../../core/services/apelacion-context.service'; // Ajusta la ruta si es necesario

export interface Anexo {
  idAnexo:   number;
  cantidad:  number;
  tipo:      string;
  esValor:   boolean;
  monto:     number;
  otroAnexo: string;
}

@Component({
  selector: 'app-anexos',
  standalone: true,
  imports: [CommonModule, FormsModule, MainHeaderComponent],
  templateUrl: './anexos.component.html',
})
export class AnexosComponent implements OnInit {

  private apelacionService = inject(ApelacionService);
  private cdr              = inject(ChangeDetectorRef);
  private contextoService  = inject(ApelacionContextService);
  // ── Estado ─────────────────────────────────────────────────
  cargando = false;
  error: string | null = null;
  guardando = false;
  errorGuardado: string | null = null;
  exitoGuardado: string | null = null;
  tipoModal: 'success' | 'error' = 'error';
  modalVisible = false;
  modalMensaje = '';


  // ── Datos ──────────────────────────────────────────────────
  folioTramite: string | null = null;
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
    return this.nuevoAnexo.tipo.toUpperCase() === 'OTRO';
  }

  ngOnInit(): void {
    this.idApelacion = this.contextoService.apelacionId();
    this.folioTramite = this.contextoService.folioOficialia();
    if (!this.idApelacion) {
      this.mostrarModal('No hay una apelación activa en memoria. Por favor, inicie desde la captura.', 'error');
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
  mostrarModal(mensaje: string, tipo: 'success' | 'error' = 'error'): void {
  this.modalMensaje = mensaje;
  this.modalVisible = true;
  this.tipoModal = tipo;
  this.cdr.detectChanges();
}

cerrarModal(): void {
  this.modalVisible = false;
}

  // ── Sincroniza descripción cuando cambia el select ─────────
  onTipoChange(id: number): void {
    const found = this.tiposAnexo.find(t => t.id === Number(id));
    this.nuevoAnexo.tipo = found?.descripcion ?? '';
    console.log('Tipo seleccionado:', found);

    // Si no es OTRO, limpia el campo libre
    if (!this.esOtro) this.nuevoAnexo.otroAnexo = '';
  }

  // ── Agrega anexo a la lista ────────────────────────────────
  agregarAnexo(): void {
    if (!this.nuevoAnexo.idAnexo) {
    this.mostrarModal('Debes seleccionar un tipo de Anexo', 'error');
      return;
    }

    const anexo: Anexo = {
      idAnexo:   this.nuevoAnexo.idAnexo,
      cantidad:  this.nuevoAnexo.cantidad,
      tipo:      this.nuevoAnexo.tipo,
      esValor:   this.nuevoAnexo.tieneMonto,
      monto:     this.nuevoAnexo.tieneMonto ? this.nuevoAnexo.monto : 0,
      otroAnexo: this.esOtro ? this.nuevoAnexo.otroAnexo : '',
    };

    console.log(' Anexo agregado a la lista:', anexo);
    this.anexos.push(anexo);

    // Reset del formulario
    this.nuevoAnexo = { idAnexo: 0, tipo: '', cantidad: 1, tieneMonto: false, monto: 0, otroAnexo: '' };
  }

  eliminarAnexo(index: number): void {
    console.log('Eliminando anexo en índice:', index, this.anexos[index]);
    this.anexos.splice(index, 1);
  }

  // ── Guarda todos los anexos en el backend ──────────────────
guardar(): void {

  if (!this.idApelacion) {
    this.mostrarModal('Error crítico: Se perdió el ID de la apelación.', 'error');
    return;
  }
  if (!this.anexos.length) {
    this.mostrarModal('Debes agregar al menos un anexo.', 'error');
    return;
  }
  const payload = {
    idApelacion: this.idApelacion,
    anexos: this.anexos.map(a => ({
      idAnexo:   a.idAnexo,
      cantidad:  a.cantidad,
      esValor:   a.esValor,
      monto:     a.esValor ? a.monto : null,
      otroAnexo: a.tipo,
    }))
  };

  console.log('📦 Payload guardar anexos:', payload);

  this.guardando = true;

  this.apelacionService.guardarAnexos(payload)
    .pipe(finalize(() => {
      setTimeout(() => this.guardando = false);
    }))
    .subscribe({
      next: () => {
        this.mostrarModal('Anexos guardados correctamente.', 'success');
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Error al guardar los anexos.';
        this.mostrarModal(msg, 'error');
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

import { Component, DestroyRef, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainHeaderComponent } from '../../../shared/components/header/header.component';
import { ApelacionService } from '../../../core/services/apelaciones.service';
import { CatalogoBusqueda, CatalogoItem } from '../../../core/models';
import { Resultado, AnexoDetalle, FiltroChip, SearchForm } from '../../../core/models/busqueda-profunda';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface ModalState {
  show: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}
@Component({
  selector:    'app-search',
  standalone:  true,
  imports:     [CommonModule, FormsModule, MainHeaderComponent],
  templateUrl: './busquedaApelaciones.component.html',
})
export class SearchComponent implements OnInit {

  catalogoSalas:          CatalogoItem[] = [];
  catalogoNomenclaturas:  CatalogoItem[] = [];
  catalogoTiposApelacion: CatalogoItem[] = [];
  cargandoCatalogo = false;
  errorCatalogo: string | null = null;
  resultados: Resultado[] = [];

private apelacionService = inject(ApelacionService);
private destroyRef = inject(DestroyRef);
private cdr              = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarCatalogo();
  }
private cargarCatalogo(): void {
    this.cargandoCatalogo = true;
    this.errorCatalogo    = null;

    this.apelacionService.getCatalogoBusqueda()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cat: CatalogoBusqueda) => {
          console.log('Catálogo buscador en componente:', cat);
          this.catalogoSalas          = cat.salas          ?? [];
          this.catalogoNomenclaturas  = cat.nomenclaturas  ?? [];
          this.catalogoTiposApelacion = cat.tiposApelaciones ?? [];
          this.cargandoCatalogo       = false;
          this.cdr.detectChanges();  // ← fuerza render
        },
        error: (err) => {
          console.error('❌ Error catálogo buscador:', err);
          this.errorCatalogo    = 'No se pudo cargar el catálogo de opciones.';
          this.cargandoCatalogo = false;
          this.cdr.detectChanges();
        }
      });
  }


  // ── Paneles ──────────────────────────────────────────────
  busquedaOpen   = true;
  resultadosOpen = true;
  filtrosOpen    = true;

  toggleBusqueda():   void { this.busquedaOpen   = !this.busquedaOpen;   }
  toggleResultados(): void { this.resultadosOpen = !this.resultadosOpen; }
  toggleFiltros():    void { this.filtrosOpen    = !this.filtrosOpen;    }

  // ── Formulario ───────────────────────────────────────────
form: SearchForm = {
  folioOficialia:  '',
  folioApelacion:  '',
  expedienteCausa: '',
  nombreParte:     '',
  idSala:          '',  // ← ''
  idNomenclatura:  '',  // ← ''
  idTipoApelacion: '',  // ← ''
  fechaInicio:     '',
  fechaFin:        '',
};

// ── Estado de búsqueda ───────────────────────────────────
  buscando        = false;
  buscandoYaFue   = false;   // true después de la primera búsqueda
  errorBusqueda: string | null = null;
  mensajeExito:  string | null = null;  // ← nuevo

  // ── Filtros activos ──────────────────────────────────────
  filtrosActivos: FiltroChip[] = [];

  quitarFiltro(index: number): void {
    this.filtrosActivos.splice(index, 1);
  }

  modal: ModalState = {
    show: false,
    type: 'info',
    title: '',
    message: ''
  };

  // Método para abrir el modal
  openModal(type: 'success' | 'error' | 'info', title: string, message: string) {
    this.modal = { show: true, type, title, message };
    this.cdr.detectChanges();
  }

  // Método para cerrar el modal
  closeModal() {
    this.modal.show = false;
  }

  // ── Resultados ───────────────────────────────────────────
  todosResultados: Resultado[] = [];
  totalResultados = 0;

  // ── Detalle ──────────────────────────────────────────────
  filaSeleccionada: Resultado | null = null;
  tabDetalle: 'partes' | 'anexos'   = 'partes';

  seleccionarFila(r: Resultado): void {
    this.filaSeleccionada = this.filaSeleccionada === r ? null : r;
    this.tabDetalle = 'partes';
  }

  // ── Paginación ───────────────────────────────────────────
  paginaActual = 1;
  porPagina    = 10;

  get totalPaginas(): number { return Math.ceil(this.totalResultados / this.porPagina); }
  get paginaInicio(): number { return (this.paginaActual - 1) * this.porPagina + 1; }
  get paginaFin():    number { return Math.min(this.paginaActual * this.porPagina, this.totalResultados); }

  get paginas(): number[] {
    const rango: number[] = [];
    const inicio = Math.max(1, this.paginaActual - 1);
    const fin    = Math.min(this.totalPaginas, this.paginaActual + 1);
    for (let i = inicio; i <= fin; i++) rango.push(i);
    return rango;
  }

  get resultadosPagina(): Resultado[] {
    const inicio = (this.paginaActual - 1) * this.porPagina;
    return this.todosResultados.slice(inicio, inicio + this.porPagina);
  }

  irPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual     = p;
      this.filaSeleccionada = null;
    }
  }
onSearch(): void {
const tieneCriterio = Object.values(this.form).some(v => v?.toString().trim() !== '');
    if (!tieneCriterio) {
      this.openModal('info', 'Criterios requeridos', 'Debes ingresar al menos un criterio de búsqueda.');
      return;
    }
    this.buscando = true;
    this.errorBusqueda = null;

  this.apelacionService.buscarApelaciones(this.form).subscribe({
    next: (resultados: Resultado[]) => {
      console.log('Resultados:', resultados);
      this.buscando        = false;
      this.todosResultados = resultados;
      this.totalResultados = resultados.length;
      this.paginaActual    = 1;
      this.filaSeleccionada = null;
      this.resultadosOpen  = true;

      if (resultados.length === 0) {
          this.openModal('info', 'Sin resultados', 'No se encontraron registros con los criterios ingresados.');
        } else {
          // Opcional: mostrar éxito al encontrar registros
          this.mensajeExito = `Se encontraron ${resultados.length} registros.`;
        }
        this.cdr.detectChanges();
      },
    error: (err) => {
      this.buscando = false;
        this.openModal('error', 'Error de búsqueda', 'Ocurrió un error al intentar conectar con el servidor.');
        this.cdr.detectChanges();
    }
  });
}
limpiar(): void {
  this.form = {
    folioOficialia:  '',
    folioApelacion:  '',
    expedienteCausa: '',
    nombreParte:     '',
    idSala:          '',
    idNomenclatura:  '',
    idTipoApelacion: '',
    fechaInicio:     '',
    fechaFin:        '',
  };
  this.filtrosActivos   = [];
  this.todosResultados  = [];
  this.totalResultados  = 0;
  this.errorBusqueda    = null;
  this.mensajeExito     = null;
  this.filaSeleccionada = null;
  this.paginaActual     = 1;
}

    onBack(): void {
    window.history.back();
  }
}

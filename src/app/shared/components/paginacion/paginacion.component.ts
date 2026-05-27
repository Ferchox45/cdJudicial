// paginacion.component.ts
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginacion.component.html',
})
export class PaginacionComponent {

  // ── Inputs
  paginaActual    = input.required<number>();
  totalPaginas    = input.required<number>();
  totalResultados = input.required<number>();
  porPagina       = input.required<number>();

  // ── Outputs
  paginaCambio  = output<number>();
  limitCambio   = output<number>();

  // ── Computed
  readonly paginasVisibles = computed<(number | '...')[]>(() => {
    const total  = this.totalPaginas();
    const actual = this.paginaActual();

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const paginas: (number | '...')[] = [1];
    if (actual > 3)         paginas.push('...');

    const inicio = Math.max(2, actual - 1);
    const fin    = Math.min(total - 1, actual + 1);
    for (let i = inicio; i <= fin; i++) paginas.push(i);

    if (actual < total - 2) paginas.push('...');
    paginas.push(total);

    return paginas;
  });

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaCambio.emit(pagina);
  }

  cambiarLimit(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.limitCambio.emit(Number(value));
  }
}

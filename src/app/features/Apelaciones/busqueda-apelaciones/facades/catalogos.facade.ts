import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BusquedaProfService } from '../data/busquedaprof.service';
import { CatalogoItem } from '../../../../core/models/catalogo-global.model';

@Injectable({
providedIn: 'root'
}
)

export class CatalogosFacade {

  private readonly apelacionService = inject(BusquedaProfService);
  private readonly destroyRef       = inject(DestroyRef);

  // ── Estado público (signals)
  readonly salas          = signal<CatalogoItem[]>([]);
  readonly nomenclaturas  = signal<CatalogoItem[]>([]);
  readonly apelaciones = signal<CatalogoItem[]>([]);
  readonly cargando       = signal(false);

  cargar(): void {
    this.cargando.set(true);

    this.apelacionService.getCatalogoBusqueda()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cat) => {
          this.salas.set(cat.salas           ?? []);
          this.nomenclaturas.set(cat.nomenclaturas  ?? []);
          this.apelaciones.set(cat.apelaciones ?? []);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
        },
      });
  }
}

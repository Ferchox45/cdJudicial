import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApelacionService } from '../../../../core/services/apelaciones.service';
import { CatalogoItem } from '../../../../core/models';

// ─────────────────────────────────────────────────────────────────────────────
// Facade
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class CatalogosFacade {

  private readonly apelacionService = inject(ApelacionService);
  private readonly destroyRef       = inject(DestroyRef);

  // ── Estado público (signals) ────────────────────────────────────────────────
  readonly salas          = signal<CatalogoItem[]>([]);
  readonly nomenclaturas  = signal<CatalogoItem[]>([]);
  readonly tiposApelacion = signal<CatalogoItem[]>([]);
  readonly cargando       = signal(false);

  // ── Carga ───────────────────────────────────────────────────────────────────

  cargar(): void {
    this.cargando.set(true);

    this.apelacionService.getCatalogoBusqueda()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cat) => {
          this.salas.set(cat.salas           ?? []);
          this.nomenclaturas.set(cat.nomenclaturas  ?? []);
          this.tiposApelacion.set(cat.tiposApelaciones ?? []);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
        },
      });
  }
}

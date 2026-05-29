import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BusquedaProfService } from '../../../apelaciones/busqueda-apelaciones/data/busquedaprof.service';
import { CatalogoItem } from '../../../../core/models/catalogo-global.model';


@Injectable({
  providedIn: 'root',
})
export class CatalogoFacade {

  private readonly buscadoresService = inject(BusquedaProfService)
  private readonly destroyRef       = inject(DestroyRef);
  readonly salas          = signal<CatalogoItem[]>([]);
  readonly cargando       = signal(false);
  cargar(): void {
    this.cargando.set(true);
    this.buscadoresService.getCatalogoBusqueda()
    .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cat) => {
          this.salas.set(cat.salas ?? []);
          console.log(this.salas());
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
        },
      });
  }
}

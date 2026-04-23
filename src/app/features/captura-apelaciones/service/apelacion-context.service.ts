import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApelacionContextService {
  // Inicializamos los signals para almacenar el ID y el Folio
  apelacionId = signal<number | null>(null);
  folioOficialia = signal<string | null>(null);

  setContexto(id: number, folio: string) {
    this.apelacionId.set(id);
    this.folioOficialia.set(folio);
  }

  // Útil para limpiar la memoria cuando termines de subir los anexos
  limpiarContexto() {
    this.apelacionId.set(null);
    this.folioOficialia.set(null);
  }
}

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApelacionContextService {
  // Se inicializan los signals para almacenar el ID y el Folio
  apelacionId = signal<number | null>(null);
  folioOficialia = signal<string | null>(null);
  sala = signal<string | null>(null);

// Método para establecer el contexto con el ID y el Folio
  setContexto(id: number, folio: string, sala: string) {
    this.apelacionId.set(id);
    this.folioOficialia.set(folio);
    this.sala.set(sala);
  }

  // Limpia la memoria cuando se acaban de subir los anexos
  limpiarContexto() {
    this.apelacionId.set(null);
    this.folioOficialia.set(null);
    this.sala.set(null);
  }
}

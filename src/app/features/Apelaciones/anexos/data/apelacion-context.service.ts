import { Injectable, signal } from '@angular/core';
import { Anexo } from '../models/anexo.model';

@Injectable({
  providedIn: 'root'
})
export class ApelacionContextService {
  apelacionId = signal<number | null>(null);
  folioOficialia = signal<string | null>(null);
  sala = signal<string | null>(null);
  anexosPrevios = signal<Anexo[]>([]);

  setContexto(id: number, folio: string, sala: string, anexos: Anexo[] = []) {
    this.apelacionId.set(id);
    this.folioOficialia.set(folio);
    this.sala.set(sala);
    this.anexosPrevios.set(anexos);
  }

  limpiarContexto() {
    this.apelacionId.set(null);
    this.folioOficialia.set(null);
    this.sala.set(null);
    this.anexosPrevios.set([]);
  }
}

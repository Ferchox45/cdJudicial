import { Injectable, signal } from '@angular/core';
import { Anexo } from '../models/anexo.model';

export interface SearchState {
  formValues: Record<string, any>;
  busquedaExitosa: boolean;
  busquedaFallida: boolean;
  bloquearBtn: boolean;
  bloquearSeccion: boolean;
  apelacionId: number | null;
  tieneAnexos: boolean;
  anexos: any[];
  folioOficialia: string | null;
  sala: string | null;
  importadoNS: boolean | null;
  partes: any[];
  relaciones: any[];
  delitosDisponibles: any[];
  idsProcesadosSeleccionados: number[];
  idsOfendidosSeleccionados: number[];
  busquedaDelitoTexto: string;
  busquedaRapida: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApelacionContextService {
  apelacionId = signal<number | null>(null);
  folioOficialia = signal<string | null>(null);
  sala = signal<string | null>(null);
  anexosPrevios = signal<Anexo[]>([]);

  private searchState = signal<SearchState | null>(null);

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
    this.searchState.set(null);
  }

  saveSearchState(state: SearchState): void {
    this.searchState.set(state);
  }

  getSearchState(): SearchState | null {
    return this.searchState();
  }

  clearSearchState(): void {
    this.searchState.set(null);
  }
}

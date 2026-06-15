import { CatalogoItem } from "../../../../core/models/catalogo-global.model";
export interface Anexo {
  idAnexo:   number;
  cantidad:  number;
  tipo:      string;
  esValor:   boolean;
  monto:     number | null;
  otroAnexo: string;
}

export interface CapturaAnexoCatalogos {
  anexo: CatalogoItem[];
}

export interface AnexoPayload {
  idApelacion: number;
  anexos: Anexo[];
  idAreaSistemaUsuario?: number;
  idPantalla?: number;
}

export interface AnexoSaveResponse {
  status: string;
  message?: string;
  data?: unknown;
}

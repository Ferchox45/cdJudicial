import { CatalogoItem } from "../../captura-apelaciones/models/catalogo-apelaciones.model";

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
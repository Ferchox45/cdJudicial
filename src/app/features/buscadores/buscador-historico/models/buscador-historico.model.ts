import { CatalogoItem } from "../../../apelaciones/captura-apelaciones/models/catalogo-apelaciones.model";

export interface catBusqHistorica{
salas: CatalogoItem[];
}

export interface ResultadoBusquedaHistorica {
  toca:            string | null;
  expedienteCausa: string | null;
  fechaApelacion:  string | null;
  fechaRecepcionApelacion: string | null;
  imputado:        string | null;
  victima:         string | null;
  delito:          string | null;
  sala:            string | null;
  juzgado:         string | null;
}

export interface ApiResponseHistorico{
  data:{
    historico: ResultadoBusquedaHistorica[];
    total: number;
    page:  number;
    limit: number;
  };
}

export interface PaginacionHistorico {
  total: number;
  page:  number;
  limit: number;
}

export interface PagedResultHistorico {
  resultados: ResultadoBusquedaHistorica[];
  paginacion: PaginacionHistorico;
}

export interface searchFormHistorico{
  expedienteCausa: string | null;
  toca: string | null;
  idSala: string | null;
  fechaRecepcionInicial: string | null;
  fechaRecepcionFinal: string | null;
  fechaApelacionInicial: string | null;
  fechaApelacionFinal: string | null;
  imputado: string | null;
  victima: string | null;
  delito: string | null;
  observacion: string | null;
}

export interface BusquedaHistoricoDTO {
  expedienteCausa?: string;
  toca?: string;
  idSala?: number;
  fechaRecepcionInicial?: string;
  fechaRecepcionFinal?: string;
  fechaApelacionInicial?: string;
  fechaApelacionFinal?: string;
  imputado?: string;
  victima?: string;
  delito?: string;
  observacion?: string;
}
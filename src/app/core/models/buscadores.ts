import { CatalogoItem } from "./catalogo.model";

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

export interface searchFormPlana{
  folioOficialia: string | null;
  folioApelacion: string | null;
  idSala: string | null;
  idApelacion: string | null;
  idNomenclatura: string | null;
  expedienteCausa: string | null;
  observacion: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
}

export interface ResultadoBusquedaPlana {
  folioOficialia: string | null;
  folioApelacion: string | null;
  folioApelacionAnterior: string | null;
  folioOficio: string | null;
  tramite: string | null;
  fojas: number | null;
  expedienteAcumulado: string | null;
  esReposicion: boolean | null;
  expedienteCausa: string | null;
  fechaAuto: string | null;
  fechaHoraRecepcion: string | null;
  fechaHoraIngresoJuz: string | null;
  observaciones: string | null;
  asunto: string | null;
  lugarHechos: string | null;
  sala: string | null;
  salaAnterior: string | null;
  juzgado: string | null;
  magistrado: string | null;
  nomenclatura: string | null;
  apelacion: string | null;
  tipoApelacion: string | null;
  tipoEscrito: string | null;
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

export interface ApiResponsePlana{
    data:{
    plana: ResultadoBusquedaPlana[];
    total: number;
    page:  number;
    limit: number;
  };
}

export interface PaginacionPlana{
  total: number;
  page:  number;
  limit: number;
}

export interface PagedResultPlana{
  resultados: ResultadoBusquedaPlana[];
  paginacion: PaginacionPlana;
}

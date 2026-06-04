export interface SearchFormPlana{
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

export interface BusquedaPlanoDTO {
  folioOficialia?: string;
  folioApelacion?: string;
  idSala?: number;
  idApelacion?: number;
  idNomenclatura?: number;
  expedienteCausa?: string;
  observacion?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ApiResponsePlana{
    data:{
    planos: ResultadoBusquedaPlana[];
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

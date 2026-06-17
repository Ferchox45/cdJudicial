export interface TurnoSearchForm {
  folioOficialia: string;
  folioApelacion: string;
  idSala: string;
}

export interface TurnoListItemDTO {
  id: number;
  folioOficialia: string;
  folioApelacion: string | null;
  nomenclatura: string | null;
  folioOficio: string | null;
  fechaRecepcion: string | null;
  fechaExportacion: string | null;
  fechaImportacion: string | null;
  estadoActual: string | null;
  apelacion: string | null;
  tipoApelacion: string | null;
  seleccionado?: boolean;
}

export interface TurnoFiltrosDTO {
  idSala?: number;
  folioOficialia?: string;
  folioApelacion?: string;
  soloTurnadas?: boolean;
}

export interface ApiResponseTurnos {
  status: string;
  message: string;
  data: {
    tocas: TurnoListItemDTO[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
}

export interface PagedResultTurnos {
  resultados: TurnoListItemDTO[];
  paginacion: PaginationInfo;
}

export interface TurnoSala {
  id: number;
  descripcion: string;
  descripcionAux: string;
  activo: boolean;
}

export interface CatalogoTurnos {
  salas: TurnoSala[];
}

export interface TurnosExportarImportarResponse {
  status: string;
  message: string;
  data: {
    afectados: number;
    total: number;
  };
}

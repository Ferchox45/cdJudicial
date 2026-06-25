export interface TurnoSearchForm {
  folioOficialia: string;
  folioApelacion: string;
  idSala: string;
  fechaRecepcionInicio: string;
  fechaRecepcionFin: string;
  idNomenclatura: string;
  estado: string;
}

export interface TurnoListItemDTO {
  idToca: number;
  idMovimiento: number;
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
  fechaRecepcionInicio?: string;
  fechaRecepcionFin?: string;
  idNomenclatura?: number;
  estado?: number;
  idPerfil?: number;
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

import { CatalogoItem } from '../../../core/models/catalogo-global.model';

export interface CatalogoTurnos {
  salas: TurnoSala[];
  nomenclaturas: CatalogoItem[];
}

export interface TurnosExportarImportarResponse {
  status: string;
  message: string;
  data: {
    afectados: number;
    total: number;
  };
}
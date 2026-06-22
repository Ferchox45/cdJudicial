export interface MovimientoPendiente {
  id: number;
  folioOficialia: string;
  folioApelacion: string | null;
  cargoOrigen: string;
  cargoDestino: string;
  cargoOrigenAnterior: string | null;
  nombreTurna: string;
  fechaTurno: string;
  seleccionado?: boolean;
}

export interface ApelacionTurnable {
  idApelacion: number;
  folioOficialia: string;
  folioApelacion: string | null;
  cargoOrigen: string;
  fechaUltimoMovimiento: string;
}

export interface CatalogoItem {
  id: number;
  descripcion: string;
}

export interface UsuarioOpcion {
  idGeneral: number;
  nombre: string;
  idProyectistaMagistrado: number;
}

export interface OpcionesTurnar {
  perfilActual: string;
  perfilesDestino: CatalogoItem[];
  proyectistas: UsuarioOpcion[];
  magistrados: UsuarioOpcion[];
}

export interface MovimientoKardex {
  id: number;
  paso: string;
  cargoTurna: string;
  nombreTurna: string;
  fechaTurno: string;
  cargoRecibe: string | null;
  nombreRecibe: string | null;
  fechaRecibe: string | null;
}

export interface KardexResponse {
  folioOficialia: string;
  folioApelacion: string | null;
  movimientos: MovimientoKardex[];
}

export interface ApiResponseEnvelope<T> {
  status: string;
  message: string;
  data: T;
}

export interface ApiPagedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PagedResult<T> {
  resultados: T[];
  paginacion: PaginationInfo;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
}

export interface BatchResponse {
  afectados: number;
  total: number;
  mensaje: string;
}

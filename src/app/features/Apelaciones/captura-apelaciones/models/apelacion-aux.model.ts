export interface DelitoDisponible {
  id: number;
  delito: string;
  seleccionado: boolean;
}

export interface ApelacionFormValue {
  materiaId: number | null;
  apelacionId: number | null;
  tipoApelacionId: number | null;
  fechaAuto: string | null;
  expedienteCausa: string | null;
  tipoEscritoId: number | null;
  folioOficio: string | null;
  juzgadoId: number | null;
  expedienteAcumulado: string | null;
  fojas: number | null;
  municipioId: number | null;
  localidadId: number | null;
  magistradoId: number;
  etniaId: number | null;
  otroEtnia: string | null;
  asunto: string | null;
  lugarHechos: string | null;
  esReposicion: boolean;
  observaciones: string | null;
  folioTentativo: string;
}

export interface ApelacionPayloadRelacionParte {
  nombre: string;
  idTipoParte: number | null;
  idSexo: number | null;
  direccion: string | null;
  menorEdad: boolean;
}

export interface ApelacionPayloadRelacionNuevo {
  idxOfendido: number;
  idxProcesado: number;
  delitos: number[];
}

export interface ApelacionPayload {
  idMateria: number | null;
  idApelacion?: number | null;
  idTipoApelacion: number | null;
  idTipoEscrito?: number | null;
  idJuzgado?: number | null;
  idMunicipio?: number | null;
  idLocalidad?: number | null;
  idEtnia?: number | null;
  otroEtnia?: string | null;
  fechaAuto?: string | null;
  expedienteCausa?: string | null;
  expedienteAcumulado?: string | null;
  folioOficio?: string | null;
  fojas?: number | null;
  observaciones?: string | null;
  asunto?: string | null;
  lugarHechos?: string | null;
  esReposicion: boolean;
  partes?: ApelacionPayloadRelacionParte[];
  relaciones?: ApelacionPayloadRelacionNuevo[];
  idAreaSistemaUsuario: number | null;
  idPantalla: number | null;
  idTramite?: number;
}

export interface ApelacionSaveResponseData {
  id: number;
  folioOficialia: string;
  sala: string;
}

export interface ApelacionSaveResponse {
  status: string;
  message?: string;
  data: ApelacionSaveResponseData;
}

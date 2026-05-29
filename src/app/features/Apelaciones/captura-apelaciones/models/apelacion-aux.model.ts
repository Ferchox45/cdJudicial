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


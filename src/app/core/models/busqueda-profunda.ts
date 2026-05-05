export interface ParteBusquedaResultado {
  tipoParte:   string;
  nombre: string;
  sexo:   string;
  direccion: string;
  menorEdad: boolean;
}

export interface AnexoDetalle {
  id: number
  cantidad: number;
  descripcion: string;
  esValor:  boolean;
  monto:    number;
}

export interface Resultado {
  id:                     number;
  folioOficialia:         string;
  folioApelacion:         string;
  folioApelacionAnterior: string;
  folioOficio:            string;
  fojas:                  number;
  tramite:                string;
  expedienteAcumulado:    string | null;
  esReposicion:           boolean;
  expedienteCausa:        string;
  fechaAuto:              string | null;
  fechaHoraRecepcion:     string | null;
  fechaHoraIngresoJuz:    string | null;
  observaciones:          string | null;
  asunto:                 string | null;
  lugarHechos:            string | null;
  sala:                   string | null;
  salaAnterior:           string | null;
  juzgadoOrigen:          string | null;
  magistradoAsignado:     string | null;
  nomenclatura:           string | null;
  apelacion:              string | null;
  tipoApelacion:          string | null;
  tipoEscrito:            string | null;
  anexos:                 AnexoDetalle[];
  partes:                 ParteBusquedaResultado[];
}

export interface SearchForm {
  folioOficialia:  string;
  folioApelacion:  string;
  expedienteCausa: string;
  nombreParte:     string;
  idSala:          string;  // ← string
  idNomenclatura:  string;  // ← string
  idApelacion: string;  // ← string
  fechaInicio:     string;
  fechaFin:        string;
}

export interface FiltroChip {
  label: string;
  campo: keyof SearchForm;
}

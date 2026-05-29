import { CatalogoItem } from "../../../../core/models/catalogo-global.model";

export interface ParteBusquedaResultado {
  tipoParte:      string;
  nombre:         string;
  sexo:           string;
  direccion:      string;
  menorEdad:     boolean;
}

export interface AnexoDetalle {
  id:           number;
  cantidad:     number;
  descripcion:  string;
  esValor:      boolean;
  monto:        number;
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
  juzgado:                string | null;
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
  idSala:          string;
  idNomenclatura:  string;
  idApelacion:      string;
  fechaInicio:     string;
  fechaFin:        string;
}

export interface FiltroChip {
  label: string;
  campo: keyof SearchForm;
}

export interface BusquedaDTO {
  folioOficialia?:  string;
  folioApelacion?:  string;
  expedienteCausa?: string;
  nombreParte?:     string;
  idSala?:          number;
  idNomenclatura?:  number;
  apelaciones?:     number;
  fechaInicio?:     string;
  fechaFin?:        string;
}

export interface ApiResponseBusqProf{
  data: {
    apelaciones: Resultado[];
    total: number;
    page:  number;
    limit: number;
  };
}

export interface PaginacionProf{
  total: number;
  page:  number;
  limit: number;
}

export interface PagedResultProf{
  resultados: Resultado[];
  paginacion: PaginacionProf;
}

export interface CatalogoBusqueda {
  salas: CatalogoItem[];
  nomenclaturas: CatalogoItem[];
  apelaciones: CatalogoItem[];
}

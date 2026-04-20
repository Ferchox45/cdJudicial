import { CatalogoItem } from "./catalogo.model";

export interface DelitoBusqueda {
  id: string;
  nombreDelito: string;
}

export interface ParteBusqueda {
  id:        string;
  nombre:    string;
  direccion: string;
  esMenor:   string;   // viene como "1" | "0" desde la API
  sexo:      string;
  tipoParte: string;
}

export interface RelacionBusqueda {
  id:              string;
  activo:          boolean;
  procesado:       ParteBusqueda | null;
  ofendido:        ParteBusqueda | null;
  delitosRelacion: DelitoBusqueda[];
}

export interface ApelacionBusqueda {
  id:              number;
  folioOficialia:  string;
  folioApelacion:  string;
  expedienteCausa: string;
  fojas:           number;
  esReposicion:    boolean;
  fechaAuto:       string | null;
  observaciones:   string | null;
  materia:         CatalogoItem | null;
  tipoApelacion:   CatalogoItem | null;
  tipoEscrito:     CatalogoItem | null;
  juzgadoOrigen:   CatalogoItem | null;
  municipio:       CatalogoItem | null;
  localidad:       CatalogoItem | null;
  relaciones:      RelacionBusqueda[];
}

export interface NoseencontroBusqueda {
  mensaje: string;
}

import { CatalogoItem } from "./catalogo.model";

export interface Parte {
  id:           number;
  nombre:       string;
  sexo:         string;
  tipoParte:    string; // 'Promovente', 'Procesado', etc.
  direccion:    string;
  menorEdad:    boolean;
  seleccionada: boolean;
}

export interface DelitoBusqueda {
  id: number;
  delito: CatalogoItem;
}

export interface ParteBusqueda {
  id:        number;
  nombre:    string;
  direccion: string;
  menorEdad: boolean;
  sexo:      string;
  tipoParte: string;
}

export interface RelacionBusqueda {
  id:              string;
  ofendido:        ParteBusqueda | null;
  procesado:       ParteBusqueda | null;
  delitosRelacion: DelitoBusqueda[];
}

export interface ApelacionBusqueda {
  id:              number;
  folioTentativo:  string;
  folioApelacion:  string;
  expedienteCausa: string;
  fojas:           number;
  esReposicion:    boolean;
  fechaAuto:       string | null;
  observaciones:   string | null;
  asunto:          string | null;
  lugarHechos:     string | null;
  materia:         CatalogoItem | null;
  tipoApelacion:   CatalogoItem | null;
  tipoEscrito:     CatalogoItem | null;
  juzgadoOrigen:   CatalogoItem | null;
  magistrado:      CatalogoItem | null;
  municipio:       CatalogoItem | null;
  localidad:       CatalogoItem | null;
  etnia:           CatalogoItem | null;
  relaciones:      RelacionBusqueda[];
}


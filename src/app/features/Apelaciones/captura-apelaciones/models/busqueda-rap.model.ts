import { CatalogoItem } from "../../../../core/models/catalogo-global.model";

export interface Parte {
  id:           number;
  nombre:       string;
  sexo:         string;
  tipoParte:    string; // 'Promovente', 'Procesado', etc.
  direccion:    string;
  menorEdad:    boolean;
  seleccionada: boolean;
  roleOrigin?: 'ofendido' | 'procesado';
}

export interface DelitoBusqueda {
  id: number;
  delito: CatalogoItem;
}

export interface ParteBusqueda {
  id:        number;
  nombre:    string;
  direccion: string | null;
  menorEdad: boolean;
  sexo:      CatalogoItem;
  tipoParte: CatalogoItem;
}

export interface RelacionBusqueda {
  id:              string;
  ofendido:        ParteBusqueda | null;
  procesado:       ParteBusqueda | null;
  delitosRelacion: DelitoBusqueda[];
}

export interface BusquedaRapida {
  id:              number;
  folioOficilia:   string;
  folioTentativo:  string;
  folioOficio:     string;
  folioApelacion:  string;
  expedienteCausa: string;
  expedienteAcumulado: string;
  fojas:           number;
  esReposicion:    boolean;
  fechaAuto:       string | null;
  observaciones:   string | null;
  asunto:          string | null;
  lugarHechos:     string | null;
  catMateria:      CatalogoItem | null;
  catApelacion:    CatalogoItem | null;
  tipoApelacion:   CatalogoItem | null;
  tipoEscrito:     CatalogoItem | null;
  catJuzgado:         CatalogoItem | null;
  catMunicipio:       CatalogoItem | null;
  catLocalidad:       CatalogoItem | null;
  catEtnia:           CatalogoItem | null;
  catMagistrado:      CatalogoItem | null;
  relaciones:      RelacionBusqueda[];
}


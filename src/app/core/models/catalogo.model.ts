export interface CatalogoItem {
  id: number;
  descripcion: string;
}

export interface Anexo {
  idAnexo:   number;
  cantidad:  number;
  tipo:      string;
  esValor:   boolean;
  monto:     number | null;
  otroAnexo: string;
}

// Respuesta completa del endpoint /capturar-apelacion
export interface CapturaApelacionCatalogos {
  folioTentativo:   string
  materias:         CatalogoItem[];
  apelaciones:      CatalogoItem[];
  tiposApelaciones: CatalogoItem[];
  tiposEscritos:    CatalogoItem[];
  juzgados:         CatalogoItem[];
  magistrados:      CatalogoItem[];
  municipios:       CatalogoItem[];
  localidades:      CatalogoItem[];
  etnias:           CatalogoItem[];
  delitos :         CatalogoItem[];
  tiposPartes:      CatalogoItem[];
  sexos:            CatalogoItem[];
}

export interface CapturaAnexoCatalogos {
  anexo: CatalogoItem[];
}

export interface CatalogoBusqueda {
  salas: CatalogoItem[];
  nomenclaturas: CatalogoItem[];
  apelaciones: CatalogoItem[];
}

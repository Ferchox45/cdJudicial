export interface CatalogoItem {
  id: number;
  descripcion: string;
}

// Respuesta completa del endpoint /capturar-apelacion
export interface CapturaApelacionCatalogos {
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
  folioTentativo:   string
}

export interface CapturaAnexoCatalogos {
  anexo: CatalogoItem[];
}

export interface CatalogoBusqueda {
  salas: CatalogoItem[];
  nomenclaturas: CatalogoItem[];
  apelaciones: CatalogoItem[];
}

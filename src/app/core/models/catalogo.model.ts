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
  municipios:       CatalogoItem[];
  localidades:      CatalogoItem[];
  delitos :         CatalogoItem[];
}

export interface CapturaAnexoCatalogos {
  anexo: CatalogoItem[];
}

export interface CatalogoBusqueda {
  salas: CatalogoItem[];
  nomenclaturas: CatalogoItem[];
  tiposApelaciones: CatalogoItem[];
}

import { CatalogoItem } from "../../../../core/models/catalogo-global.model";

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





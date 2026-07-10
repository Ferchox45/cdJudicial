export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

export interface Area {
  idAreaSistema: number;
  area: string;
  idArea: number;
}

export interface ConfiguracionArea {
  idAreaSistemaUsuario: number;
  perfiles: PerfilUsuario[];
  subareas: SubArea[];
}

export interface PerfilUsuario {
  idSistemaPerfil: number;
  descripcion: string;
}

export interface SubArea {
  idSubArea: number;
  descripcion: string;
}

export interface Sala {
  idSala: number;
  descripcion: string;
}

export interface ModuloPantalla {
  idSistemaModulo: number;
  nombre: string;
  descripcion: string;
  ejecutable: string;
  pantallas: Pantalla[];
}

export interface Pantalla {
  idPantalla: number;
  nombre: string;
  descripcion: string;
  idSistemaModulo: number;
  tipoCatalogo: string | null;
  idCatalogo: number | null;
  ejecutable: string;
  valores: string;
  exe: string;
  imagen: string;
  acceso: string;
  orden: number;
  fechaProduccion: string;
  visibleMenu: boolean;
}

export interface Seccion {
  idSeccion: number;
  descripcion: string;
  activo: boolean;
}

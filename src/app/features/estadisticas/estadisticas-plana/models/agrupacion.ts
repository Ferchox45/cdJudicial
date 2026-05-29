export type CampoAgrupacion =
  | 'sala'
  | 'folioOficialia'
  | 'folioToca'
  | 'nomenclatura'
  | 'apelacion'
  | 'tipoApelacion'
  | 'mesRecep'
  | 'anioRecep';

export interface OpcionAgrupacion {
  campo:    CampoAgrupacion;
  etiqueta: string;
}

export const OPCIONES_AGRUPACION: OpcionAgrupacion[] = [
  { campo: 'sala',          etiqueta: 'Sala'               },
  { campo: 'folioOficialia',etiqueta: 'Folio de Oficialía' },
  { campo: 'folioToca',     etiqueta: 'Folio del Toca'     },
  { campo: 'nomenclatura',  etiqueta: 'Nomenclatura'       },
  { campo: 'apelacion',     etiqueta: 'Apelación'          },
  { campo: 'tipoApelacion', etiqueta: 'Tipo de Apelación'  },
  { campo: 'mesRecep',      etiqueta: 'Mes'                },
  { campo: 'anioRecep',     etiqueta: 'Año'                },
];

// estadisticas.model.ts
export interface GrupoAgrupado {
  id:        string;           // clave única del grupo
  valor:     string | null;    // valor de la celda principal (ej: "OCTAVA SALA...")
  nivel:     number;
  total:     number;
  hijos:     (GrupoAgrupado | FilaDato)[];
  expandido: boolean;
}

export interface FilaDato {
  tipo:    'dato';
  celdas:  Record<CampoAgrupacion, string | number | null>;
  total:   number;
}

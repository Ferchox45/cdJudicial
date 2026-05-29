export type NivelColapso = 'sala' | 'anio' | 'mes' | 'nom' | 'ape';

export function buildKey(row: any, nivel: NivelColapso): string {
  switch (nivel) {
    case 'sala': return `S:${row._sala}`;
    case 'anio': return `A:${row._sala}|${row._anio}`;
    case 'mes':  return `M:${row._sala}|${row._anio}|${row._mes}`;
    case 'nom':  return `N:${row._sala}|${row._anio}|${row._mes}|${row._nom}`;
    case 'ape':  return `P:${row._sala}|${row._anio}|${row._mes}|${row._nom}|${row._ape}`;
  }
}
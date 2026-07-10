// tabla-visibility.ts
import { TableRowRich } from '../../../models/estadisticas';

type Punteros = {
  cSala: TableRowRich | null;
  cAnio: TableRowRich | null;
  cMes: TableRowRich | null;
  cNom: TableRowRich | null;
  cApe: TableRowRich | null;
};

// PASO 2 y 3: aplica visibilidad y recalcula rowspans según grupos colapsados
export function applyVisibility(rows: TableRowRich[], collapsed: Set<string>): TableRowRich[] {
  let p: Punteros = { cSala: null, cAnio: null, cMes: null, cNom: null, cApe: null };

  // PASO 2 — Marcar visibilidad y acumular spans dinámicos
  for (const row of rows) {
    p = _resetPunteros(row, p);

    if (row.salaRowspan) {
      p.cSala = row;
      p.cSala._calcSalaSpan = 0;
      p.cSala.salaColapsado = collapsed.has(`S:${row._sala}`);
    }
    if (row.anioRowspan) {
      p.cAnio = row;
      p.cAnio._calcAnioSpan = 0;
      p.cAnio.anioColapsado = collapsed.has(`A:${row._sala}|${row._anio}`);
    }
    if (row.mesRowspan) {
      p.cMes = row;
      p.cMes._calcMesSpan = 0;
      p.cMes.mesColapsado = collapsed.has(`M:${row._sala}|${row._anio}|${row._mes}`);
    }
    if (row.nomRowspan) {
      p.cNom = row;
      p.cNom._calcNomSpan = 0;
      p.cNom.nomColapsado = collapsed.has(`N:${row._sala}|${row._anio}|${row._mes}|${row._nom}`);
    }
    if (row.apeRowspan) {
      p.cApe = row;
      p.cApe._calcApeSpan = 0;
      p.cApe.apeColapsado = collapsed.has(
        `P:${row._sala}|${row._anio}|${row._mes}|${row._nom}|${row._ape}`,
      );
    }

    row.oculto = _isOculto(row, p);

    if (!row.oculto) {
      if (p.cSala) p.cSala._calcSalaSpan!++;
      if (p.cAnio) p.cAnio._calcAnioSpan!++;
      if (p.cMes && !(row.isSubtotal && row.level! <= 3)) p.cMes._calcMesSpan!++;
      if (p.cNom && !(row.isSubtotal && row.level! <= 4)) p.cNom._calcNomSpan!++;
      if (p.cApe && !(row.isSubtotal && row.level! <= 5)) p.cApe._calcApeSpan!++;
    }
  }

  // PASO 3 — Sobreescribir rowspans originales por los recalculados
  for (const row of rows) {
    if (row.salaRowspan !== undefined) row.salaRowspan = row._calcSalaSpan;
    if (row.anioRowspan !== undefined) row.anioRowspan = row._calcAnioSpan;
    if (row.mesRowspan !== undefined) row.mesRowspan = row._calcMesSpan;
    if (row.nomRowspan !== undefined) row.nomRowspan = row._calcNomSpan;
    if (row.apeRowspan !== undefined) row.apeRowspan = row._calcApeSpan;
  }

  return rows;
}

// ── Helpers privados

function _isOculto(row: TableRowRich, p: Punteros): boolean {
  if (p.cSala?.salaColapsado && row !== p.cSala) return true;
  if (p.cAnio?.anioColapsado && row !== p.cAnio) return true;
  if (p.cMes?.mesColapsado && row !== p.cMes) return true;
  if (p.cNom?.nomColapsado && row !== p.cNom) return true;
  if (p.cApe?.apeColapsado && row !== p.cApe) return true;
  return false;
}

// Devuelve un nuevo objeto para evitar mutación del puntero original
function _resetPunteros(row: TableRowRich, p: Punteros): Punteros {
  return {
    cSala: row._sala ? p.cSala : null,
    cAnio: row._anio ? p.cAnio : null,
    cMes: row._mes ? p.cMes : null,
    cNom: row._nom ? p.cNom : null,
    cApe: row._ape ? p.cApe : null,
  };
}

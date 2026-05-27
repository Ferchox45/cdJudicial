import { ChartSlice, TableRowRich } from '../../../models/estadisticas';

// ── Tipos internos para la estructura jerárquica del facade

interface TipoData   { total: number; }
interface ApeData    { total: number; tipos: Record<string, TipoData>; }
interface NomData    { total: number; apelaciones: Record<string, ApeData>; }
interface MesData    { total: number; nomenclaturas: Record<string, NomData>; }
interface AnioData   { total: number; meses: Record<string, MesData>; }
interface SalaData   { sala: string;  anios: Record<string, AnioData>; }

// ── API pública

export function buildTableRows(data: SalaData[]): { rows: TableRowRich[]; totalGeneral: number } {
  const rows: TableRowRich[] = [];
  let totalGeneral = 0;

  for (const salaData of data) {
    const { rows: salaRows, totalGeneral: salaTotal } = _buildSalaRows(salaData);
    totalGeneral += salaTotal;

    if (salaRows.length > 0) {
      salaRows[0].sala           = salaData.sala;
      salaRows[0].salaRowspan    = salaRows.length;
      salaRows[0].salaChartData  = _salaChart(salaData);
      salaRows[0].salaChartTitle = salaData.sala;
    }

    rows.push(...salaRows);
  }

  return { rows, totalGeneral };
}

// ── Nivel Sala

function _salaChart(salaData: SalaData): ChartSlice[] {
  return Object.entries(salaData.anios).map(
    ([anioStr, anioData]) => ({ label: anioStr, value: anioData.total })
  );
}

function _buildSalaRows(salaData: SalaData): { rows: TableRowRich[]; totalGeneral: number } {
  const rows: TableRowRich[] = [];
  let totalGeneral = 0;

  for (const [anioStr, anioData] of Object.entries(salaData.anios)) {
    const anioRows = _buildAnioRows(salaData.sala, anioStr, anioData);
    totalGeneral  += anioData.total;

    const anioChart: ChartSlice[] = Object.entries(anioData.meses).map(
      ([mesStr, mesData]) => ({ label: mesStr, value: mesData.total })
    );

    if (anioRows.length > 0) {
      anioRows[0].anio           = anioStr;
      anioRows[0].anioRowspan    = anioRows.length;
      anioRows[0].anioChartData  = anioChart;
      anioRows[0].anioChartTitle = `${salaData.sala} | ${anioStr}`;
    }

    rows.push(...anioRows);
  }

  return { rows, totalGeneral };
}

// ── Nivel Año

function _buildAnioRows(sala: string, anioStr: string, anioData: AnioData): TableRowRich[] {
  const rows: TableRowRich[] = [];

  for (const [mesStr, mesData] of Object.entries(anioData.meses)) {
    const mesChart: ChartSlice[] = Object.entries(mesData.nomenclaturas).map(
      ([nomStr, nomData]) => ({ label: nomStr, value: nomData.total })
    );

    const mesRows = _buildMesRows(sala, anioStr, mesStr, mesData);

    if (mesRows.length > 0) {
      mesRows[0].mes           = mesStr;
      mesRows[0].mesRowspan    = mesRows.length;
      mesRows[0].mesChartData  = mesChart;
      mesRows[0].mesChartTitle = `${sala} | ${anioStr} | ${mesStr}`;
    }

    if (Object.keys(mesData.nomenclaturas).length > 1) {
      mesRows.push({
        isSubtotal: true, level: 3,
        label: `${mesStr} TOTAL`, total: mesData.total,
        chartData: mesChart, chartTitle: `${sala} | ${anioStr} | ${mesStr}`,
        _sala: sala, _anio: anioStr, _mes: mesStr,
      });
    }

    rows.push(...mesRows);
  }

  return rows;
}

// ── Nivel Mes

function _buildMesRows(sala: string, anioStr: string, mesStr: string, mesData: MesData): TableRowRich[] {
  const rows: TableRowRich[] = [];

  for (const [nomStr, nomData] of Object.entries(mesData.nomenclaturas)) {
    const nomChart: ChartSlice[] = Object.entries(nomData.apelaciones).map(
      ([apeStr, apeData]) => ({ label: apeStr, value: apeData.total })
    );

    const nomRows = _buildNomRows(sala, anioStr, mesStr, nomStr, nomData);

    if (nomRows.length > 0) {
      nomRows[0].nom           = nomStr;
      nomRows[0].nomRowspan    = nomRows.length;
      nomRows[0].nomChartData  = nomChart;
      nomRows[0].nomChartTitle = `${sala} | ${anioStr} | ${mesStr} | ${nomStr}`;
    }

    if (Object.keys(nomData.apelaciones).length > 1) {
      nomRows.push({
        isSubtotal: true, level: 4,
        label: `${nomStr} TOTAL`, total: nomData.total,
        chartData: nomChart, chartTitle: `${sala} | ${anioStr} | ${mesStr} | ${nomStr}`,
        _sala: sala, _anio: anioStr, _mes: mesStr, _nom: nomStr,
      });
    }

    rows.push(...nomRows);
  }

  return rows;
}

// ── Nivel Nomenclatura

function _buildNomRows(
  sala: string, anioStr: string, mesStr: string, nomStr: string, nomData: NomData
): TableRowRich[] {
  const rows: TableRowRich[] = [];

  for (const [apeStr, apeData] of Object.entries(nomData.apelaciones)) {
    const apeChart: ChartSlice[] = Object.entries(apeData.tipos).map(
      ([tipoStr, tipoData]) => ({ label: tipoStr, value: tipoData.total })
    );
    const apeTitle = `${sala} | ${anioStr} | ${mesStr} | ${nomStr} | ${apeStr}`;

    const apeRows = _buildApeRows(sala, anioStr, mesStr, nomStr, apeStr, apeData, apeChart, apeTitle);

    if (apeRows.length > 0) {
      apeRows[0].ape           = apeStr;
      apeRows[0].apeRowspan    = apeRows.length;
      apeRows[0].apeChartData  = apeChart;
      apeRows[0].apeChartTitle = apeTitle;
    }

    if (Object.keys(apeData.tipos).length > 1) {
      apeRows.push({
        isSubtotal: true, level: 5,
        label: `${apeStr} TOTAL`, total: apeData.total,
        chartData: apeChart, chartTitle: apeTitle,
        _sala: sala, _anio: anioStr, _mes: mesStr, _nom: nomStr, _ape: apeStr,
      });
    }

    rows.push(...apeRows);
  }

  return rows;
}

// ── Nivel Apelación

function _buildApeRows(
  sala: string, anioStr: string, mesStr: string,
  nomStr: string, apeStr: string,
  apeData: ApeData, apeChart: ChartSlice[], apeTitle: string
): TableRowRich[] {
  return Object.entries(apeData.tipos).map(([tipoStr, tipoData]): TableRowRich => ({
    isData:     true,
    tipo:       tipoStr,
    total:      tipoData.total,
    chartData:  apeChart,
    chartTitle: apeTitle,
    clickLevel: 'tipo',
    _sala: sala, _anio: anioStr, _mes: mesStr, _nom: nomStr, _ape: apeStr,
  }));
}

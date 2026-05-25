
export interface searchFormPlanaEstadistica{
idSala: string | null;
idNomenclatura: string | null;
idApelacion: string | null;
fechaInicio: string | null;
fechaFin: string | null;
}

export interface ApiResponseEstadisticas {
  status: string;
  message: string;
  data: {
    plano: any[];   // viene con ñ del backend
    total: number;
    page:  number;
    limit: number;
  };
}
// Interfaz limpia para usar en tu app
export interface ResultadoBusquedaPlanaEstadistica {
  idApelacion:             number | null;
  sala:                    string | null;
  tramite:                 string | null;
  folioOficialia:          string | null;
  nomenclatura:            string | null;
  folioToca:               string | null;
  apelacion:               string | null;
  tipoApelacion:           string | null;
  tipoEscrito:             string | null;
  fechaHoraRecepcion:      string | null;
  fechaHoraIngresoJuzgado: string | null;
  juzgadoOrigen:           string | null;
  mesRecep:                string | null;
  anioRecep:               number | null;
  mesIngreso:              string | null;
  anioIngreso:             number | null;
}

export interface PagedResult {
  resultados: ResultadoBusquedaPlanaEstadistica[];
  paginacion: PaginacionEstadistica;
  anidado?:    Record<string, any>;
}

export interface PaginacionEstadistica {
  total: number;
  page: number;
  limit: number;
}

export interface FilaEstadisticaAnidada {
  sala:          string;
  anio:          string;
  mes:           string;
  nomenclatura:  string;
  apelacion:     string;
  tipoApelacion: string;
  total:         number;
}

export interface ApiResponseAgrupada {
  status: string;
  message: string;
  data: {
    agrupado: any[];
  };
}

export interface ReporteAgrupado {
  sala: string;
  total: number;
  anios: Record<string, {
    total: number
    meses: Record<string, {
      total: number;
      nomenclaturas: Record<string, {
        total: number;
        apelaciones: Record<string, {
          total: number;
          tipos: Record<string, { total: number; }>
        }>
      }>
    }>
  }>;
}

export interface TableRow {
  isData?: boolean;
  isSubtotal?: boolean;
  sala?: string;
  anio?: string;
  mes?: string;
  nom?: string;
  ape?: string;
  tipo?: string;
  total?: number;
  level?: number;
  label?: string;
  salaRowspan?: number;
  anioRowspan?: number;
  mesRowspan?: number;
  nomRowspan?: number;
  apeRowspan?: number;
  salaChartData?: ChartSlice[];
  salaChartTitle?: string;
  anioChartData?: ChartSlice[];
  anioChartTitle?: string;
  mesChartData?: ChartSlice[];
  mesChartTitle?: string;
  nomChartData?: ChartSlice[];
  nomChartTitle?: string;
  apeChartData?: ChartSlice[];
  apeChartTitle?: string;
  chartData?: ChartSlice[];
  chartTitle?: string;
  clickLevel?: 'sala' | 'anio' | 'mes' | 'nom' | 'ape' | 'tipo';
}

export interface ChartSlice {
  label: string;
  value: number;
}

export interface TablaColumna {
  field: string;
  label: string;
  visible: boolean;
}

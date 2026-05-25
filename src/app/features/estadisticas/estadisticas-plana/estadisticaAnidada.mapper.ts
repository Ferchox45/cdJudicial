// estadisticasAnidada.mapper.ts
import { ResultadoBusquedaPlanaEstadistica } from '../../../core/models/estadisticas';
import { CampoAgrupacion, FilaTablaAgrupada, GrupoAgrupado, FilaDato } from '../../../core/models/agrupacion';

export class EstadisticaAnidadaMapper {

static construirArbol(
    datos:  ResultadoBusquedaPlanaEstadistica[],
    campos: CampoAgrupacion[]
  ): GrupoAgrupado[] {
    return this._agrupar(datos, campos, 0, '');
  }

  private static _agrupar(
    datos:    ResultadoBusquedaPlanaEstadistica[],
    campos:   CampoAgrupacion[],
    nivel:    number,
    prefijo:  string
  ): GrupoAgrupado[] {

    if (nivel >= campos.length) return [];

    const campo  = campos[nivel];
    const grupos = new Map<string, ResultadoBusquedaPlanaEstadistica[]>();

    for (const item of datos) {
      const key = String(item[campo] ?? 'Sin valor');
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(item);
    }

    const resultado: GrupoAgrupado[] = [];

    for (const [valorGrupo, items] of grupos) {
      const id = `${prefijo}__${campo}__${valorGrupo}`;
      const esUltimoNivel = nivel === campos.length - 1;

      const hijos: (GrupoAgrupado | FilaDato)[] = esUltimoNivel
        ? items.map(item => ({
            tipo:   'dato' as const,
            celdas: this._toCeldas(item),
            total:  1,
          }))
        : this._agrupar(items, campos, nivel + 1, id);

      resultado.push({
        id,
        valor:     valorGrupo,
        nivel,
        total:     items.length,
        hijos,
        expandido: nivel === 0, // solo el primer nivel abierto por default
      });
    }

    return resultado;
  }

  private static _toCeldas(
    item: ResultadoBusquedaPlanaEstadistica
  ): Record<CampoAgrupacion, string | number | null> {
    return {
      sala:          item.sala,
      folioOficialia:item.folioOficialia,
      folioToca:     item.folioToca,
      nomenclatura:  item.nomenclatura,
      apelacion:     item.apelacion,
      tipoApelacion: item.tipoApelacion,
      mesRecep:      item.mesRecep,
      anioRecep:     item.anioRecep,
    };
  }
}

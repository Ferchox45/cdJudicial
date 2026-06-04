import { SearchFormPlanaEstadistica } from "../models/estadisticas";

export interface BusquedaEstadisticaDTO{
  idSala?: number,
  idNomenclatura?: number,
  idApelacion?: number,
  fechaInicio?: string,
  fechaFin?: string,
}

export class BusquedaEstadisticaMapper{
  static toDTO(form: SearchFormPlanaEstadistica): BusquedaEstadisticaDTO{
  const dto: BusquedaEstadisticaDTO = {};
  if (form.idSala)                 dto.idSala              = Number(form.idSala);
  if (form.idNomenclatura)         dto.idNomenclatura     = Number(form.idNomenclatura);
  if (form.idApelacion)               dto.idApelacion    =Number(form.idApelacion);
  if (form.fechaInicio)            dto.fechaInicio        = form.fechaInicio;
  if (form.fechaFin)              dto.fechaFin           = form.fechaFin;
  return dto;
  }

  static tieneCriterios(form: SearchFormPlanaEstadistica): boolean {
  return Object.values(form).some(v => v?.toString().trim() !== '');
    }
}

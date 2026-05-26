import { SearchForm, BusquedaDTO } from '../models/busqueda-profunda.model';

export class BusquedaApelacionesMapper {

  /** Convierte el formulario de UI al DTO que espera el backend.
   *  Omite los campos vacíos para no enviar filtros nulos. */
  static toDTO(form: SearchForm): BusquedaDTO {
    const dto: BusquedaDTO = {};

    if (form.folioOficialia?.trim())  dto.folioOficialia  = form.folioOficialia.trim();
    if (form.folioApelacion?.trim())  dto.folioApelacion  = form.folioApelacion.trim();
    if (form.expedienteCausa?.trim()) dto.expedienteCausa = form.expedienteCausa.trim();
    if (form.nombreParte?.trim())     dto.nombreParte     = form.nombreParte.trim();
    if (form.idSala)                  dto.idSala          = Number(form.idSala);
    if (form.idNomenclatura)          dto.idNomenclatura  = Number(form.idNomenclatura);
    if (form.idApelacion)             dto.apelaciones = Number(form.idApelacion);
    if (form.fechaInicio)             dto.fechaInicio     = form.fechaInicio;
    if (form.fechaFin)                dto.fechaFin        = form.fechaFin;

    return dto;
  }

  /** Verifica si el formulario tiene al menos un criterio de búsqueda. */
  static tieneCriterios(form: SearchForm): boolean {
    return Object.values(form).some(v => v?.toString().trim() !== '');
  }
}

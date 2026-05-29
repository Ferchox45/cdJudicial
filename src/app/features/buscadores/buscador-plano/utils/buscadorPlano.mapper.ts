import { searchFormPlana, BusquedaPlanoDTO } from "../models/buscador-plano.model";

export class BusquedaPlanoMapper {
static toDTO(form: searchFormPlana): BusquedaPlanoDTO {

  // Se asignan los valores al DTO solo si no son nulos o vacíos
const dto: BusquedaPlanoDTO = {};
if (form.folioOficialia?.trim())   dto.folioOficialia       = form.folioOficialia.trim();
if (form.folioApelacion?.trim())   dto.folioApelacion       = form.folioApelacion.trim();
if (form.idSala)                 dto.idSala              = Number(form.idSala);
if (form.idApelacion)            dto.idApelacion         = Number(form.idApelacion);
if (form.idNomenclatura)         dto.idNomenclatura     = Number(form.idNomenclatura);
if (form.expedienteCausa?.trim())dto.expedienteCausa   = form.expedienteCausa.trim();
if (form.observacion?.trim())   dto.observacion      = form.observacion.trim();
if (form.fechaInicio)            dto.fechaInicio        = form.fechaInicio;
if (form.fechaFin)              dto.fechaFin           = form.fechaFin;
return dto;
  }

static tieneCriterios(form: searchFormPlana): boolean {
return Object.values(form).some(v => v?.toString().trim() !== '');
  }
}

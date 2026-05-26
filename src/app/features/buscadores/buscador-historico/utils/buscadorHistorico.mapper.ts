import { searchFormHistorico, BusquedaHistoricoDTO } from "../models/buscador-historico.model";



export class BusquedaHistoricoMapper {

static toDTO(form: searchFormHistorico): BusquedaHistoricoDTO {
const dto: BusquedaHistoricoDTO = {};

if (form.expedienteCausa?.trim())   dto.expedienteCausa       = form.expedienteCausa.trim();
if (form.toca?.trim())              dto.toca                  = form.toca.trim();
if (form.idSala)                    dto.idSala                = Number(form.idSala);
if (form.fechaRecepcionInicial)     dto.fechaRecepcionInicial = form.fechaRecepcionInicial;
if (form.fechaRecepcionFinal)       dto.fechaRecepcionFinal   = form.fechaRecepcionFinal;
if (form.fechaApelacionInicial)     dto.fechaApelacionInicial = form.fechaApelacionInicial;
if (form.fechaApelacionFinal)       dto.fechaApelacionFinal   = form.fechaApelacionFinal;
if (form.imputado?.trim())          dto.imputado              = form.imputado.trim();
if (form.victima?.trim())           dto.victima               = form.victima.trim();
if (form.delito?.trim())            dto.delito                = form.delito.trim();
if (form.observacion?.trim())       dto.observacion           = form.observacion.trim();
return dto;

  }

static tieneCriterios(form: searchFormHistorico): boolean {
return Object.values(form).some(v => v?.toString().trim() !== '');
  }
}

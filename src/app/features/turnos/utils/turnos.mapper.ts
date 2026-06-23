import { TurnoSearchForm, TurnoFiltrosDTO } from '../models/turnos.model';

export class TurnosMapper {
  static toDTO(form: TurnoSearchForm, idPerfil: number): TurnoFiltrosDTO {
    const dto: TurnoFiltrosDTO = {};
    if (form.idSala) dto.idSala = Number(form.idSala);
    if (form.folioOficialia?.trim()) dto.folioOficialia = form.folioOficialia.trim();
    if (form.folioApelacion?.trim()) dto.folioApelacion = form.folioApelacion.trim();
    if (form.fechaRecepcionInicio) dto.fechaRecepcionInicio = form.fechaRecepcionInicio;
    if (form.fechaRecepcionFin) dto.fechaRecepcionFin = form.fechaRecepcionFin;
    if (form.idNomenclatura) dto.idNomenclatura = Number(form.idNomenclatura);
    if (form.estado) dto.estado = Number(form.estado);
    dto.idPerfil = idPerfil;
    return dto;
  }

  static tieneCriterios(form: TurnoSearchForm): boolean {
    return !!form.idSala;
  }
}

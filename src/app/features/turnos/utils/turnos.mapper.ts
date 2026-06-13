import { TurnoSearchForm, TurnoFiltrosDTO } from '../models/turnos.model';

export class TurnosMapper {
  static toDTO(form: TurnoSearchForm, soloTurnadas: boolean = false): TurnoFiltrosDTO {
    const dto: TurnoFiltrosDTO = {};
    if (form.idSala) dto.idSala = Number(form.idSala);
    if (form.folioOficialia?.trim()) dto.folioOficialia = form.folioOficialia.trim();
    if (form.folioApelacion?.trim()) dto.folioApelacion = form.folioApelacion.trim();
    dto.soloTurnadas = soloTurnadas;
    return dto;
  }

  static tieneCriterios(form: TurnoSearchForm): boolean {
    return !!form.idSala;
  }
}

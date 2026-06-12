import { BusquedaRapida,
  DelitoBusqueda,
  Parte,
  ParteBusqueda,
  RelacionBusqueda,
} from '../models/busqueda-rap.model';
import { ApelacionFormValue, ApelacionPayload, DelitoDisponible } from '../models/apelacion-aux.model';
import { CatalogoItem } from '../../../../core/models/catalogo-global.model';

/** Convierte string ISO → "YYYY-MM-DD" para inputs tipo date */
export function toDateInput(isoString: string | null): string {
  if (!isoString) return '';
  return isoString.split('T')[0];
}

/** Parsea el campo menorEdad que puede llegar como boolean o string "1"/"0" */
export function parseMenor(menorEdad: unknown): boolean {
  if (typeof menorEdad === 'boolean') return menorEdad;
  if (typeof menorEdad === 'string') return menorEdad.trim() === '1';
  return false;
}

/** Formatea "PROCESADO" → "Procesado" */
export function formatTipoParte(tipo: string): string {
  if (!tipo) return '';
  return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
}

/** Mapea los campos compartidos de una ParteBusqueda a Parte */
export function mapearParteComun(p: ParteBusqueda & { menorEdad?: unknown }): Parte {
  return {
    id: Number(p.id),
    nombre: p.nombre,
    // Ahora sexo y tipoParte son CatalogoItem, extraemos la descripción
    sexo: p.sexo?.descripcion || '',
    tipoParte: p.tipoParte?.descripcion || '',
    direccion: p.direccion || '',
    menorEdad: parseMenor(p.menorEdad),
    seleccionada: false,
  };
}

/**
 * Extrae las partes únicas de una respuesta de búsqueda,
 * marcando su roleOrigin según su posición en las relaciones.
 */
export function mapearPartesDesdeRelaciones(
  relaciones: BusquedaRapida['relaciones']
): Parte[] {
  const partesMap = new Map<number, Parte>();

  relaciones?.forEach((rel) => {
    if (rel.procesado && !partesMap.has(Number(rel.procesado.id))) {
      partesMap.set(Number(rel.procesado.id), {
        ...mapearParteComun(rel.procesado as any),
        roleOrigin: 'procesado',
      });
    }
    if (rel.ofendido && !partesMap.has(Number(rel.ofendido.id))) {
      partesMap.set(Number(rel.ofendido.id), {
        ...mapearParteComun(rel.ofendido as any),
        roleOrigin: 'ofendido',
      });
    }
  });

  return Array.from(partesMap.values());
}

/** Convierte las relaciones de la API al modelo local RelacionBusqueda */
export function mapearRelaciones(
  relaciones: BusquedaRapida['relaciones']
): RelacionBusqueda[] {
  return (relaciones ?? []).map((rel) => ({
    id: rel.id.toString(),
    procesado: rel.procesado
      ? { ...rel.procesado, id: Number(rel.procesado.id) }
      : null,
    ofendido: rel.ofendido
      ? { ...rel.ofendido, id: Number(rel.ofendido.id) }
      : null,
    delitosRelacion: rel.delitosRelacion.map((dr) => ({
      id: Number(dr.id),
      delito: {
        id: Number(dr.delito.id),
        descripcion: dr.delito.descripcion,
      },
    })),
  }));
}

/** Convierte catálogo de delitos al formato interno con estado de selección */
export function mapearDelitosDisponibles(
  delitos: CatalogoItem[]
): DelitoDisponible[] {
  return (delitos ?? []).map((d) => ({
    id: d.id,
    delito: d.descripcion,
    seleccionado: false,
  }));
}

/** Sincroniza el estado "seleccionado" de los delitos con las relaciones cargadas */
export function sincronizarSeleccionDelitos(
  delitosDisponibles: DelitoDisponible[],
  relaciones: RelacionBusqueda[]
): DelitoDisponible[] {
  const idsEnRelaciones = new Set<number>();
  relaciones.forEach((rel) =>
    rel.delitosRelacion.forEach((dr) => idsEnRelaciones.add(dr.delito.id))
  );

  return delitosDisponibles.map((d) => ({
    ...d,
    seleccionado: idsEnRelaciones.has(d.id),
  }));
}

/**
 * Construye el payload para guardar una apelación.
 * Nuevo contrato: partes planas y relaciones por índice.
 */
export function buildPayload(
  raw: ApelacionFormValue,
  relaciones: RelacionBusqueda[],
  partes: Parte[],
  sexos: CatalogoItem[],
  tiposPartes: CatalogoItem[]
): ApelacionPayload {
  const esIndigena = raw.materiaId === 6;

  const partesPayload = partes.map((p) => {
    const sexoCat = sexos.find(
      (s) => s.descripcion.toUpperCase() === p.sexo?.toUpperCase()
    );
    const tipoParteCat = tiposPartes.find(
      (tp) => tp.descripcion.toUpperCase() === p.tipoParte?.toUpperCase()
    );

    let idTipoParte = tipoParteCat?.id;
    if (!idTipoParte) {
      idTipoParte = p.roleOrigin === 'ofendido' ? 1 : 2;
    }

    return {
      nombre: p.nombre,
      idTipoParte: idTipoParte ?? null,
      idSexo: sexoCat?.id ?? null,
      direccion: p.direccion || null,
      menorEdad: p.menorEdad ?? false,
    };
  });

  const relacionesPayload = relaciones.map((rel) => ({
    idxOfendido: partes.findIndex((p) => p.id === Number(rel.ofendido?.id)),
    idxProcesado: partes.findIndex((p) => p.id === Number(rel.procesado?.id)),
    delitos: rel.delitosRelacion.map((d) => Number(d.id)),
  }));

  const base: ApelacionPayload = {
    idMateria: raw.materiaId,
    esReposicion: raw.esReposicion ?? false,
    partes: partesPayload,
  };

  if (esIndigena) {
    base.idMunicipio = raw.municipioId ?? null;
    base.idLocalidad = raw.localidadId ?? null;
    base.idEtnia = raw.etniaId ?? null;
    base.otroEtnia = raw.otroEtnia ?? null;
    base.asunto = raw.asunto || null;
    base.lugarHechos = raw.lugarHechos || null;
  } else {
    base.idApelacion = raw.apelacionId;
    base.idTipoApelacion = raw.tipoApelacionId ?? null;
    base.idTipoEscrito = raw.tipoEscritoId ?? null;
    base.idJuzgado = raw.juzgadoId;
    base.fechaAuto = raw.fechaAuto || null;
    base.expedienteCausa = raw.expedienteCausa || null;
    base.expedienteAcumulado = raw.expedienteAcumulado || null;
    base.folioOficio = raw.folioOficio || null;
    base.fojas = raw.fojas ?? null;
    base.observaciones = raw.observaciones || null;
    base.relaciones = relacionesPayload;
  }

  return base;
}

/** Construye una nueva Parte a partir del valor del formulario */
export function buildNuevaParte(
  formValue: {
    nombre: string;
    sexo: string;
    tipoParte: string;
    direccion: string;
    esMenor: boolean;
  }
): Parte {
  return {
    id: Date.now(),
    nombre: formValue.nombre,
    sexo: formValue.sexo,
    tipoParte: formValue.tipoParte,
    direccion: formValue.direccion,
    menorEdad: formValue.esMenor,
    roleOrigin: formValue.tipoParte.toLowerCase().includes('ofendido')
      ? 'ofendido'
      : 'procesado',
    seleccionada: false,
  };
}

/** Construye una RelacionBusqueda nueva desde el panel de selección */
export function buildNuevaRelacion(
  procesado: Parte,
  ofendido: Parte,
  delitosSeleccionados: DelitoDisponible[]
): RelacionBusqueda {
  const mapearParteABusqueda = (p: Parte): ParteBusqueda => ({
    id: Number(p.id),
    nombre: p.nombre,
    // Se envuelve el string en la estructura CatalogoItem para satisfacer ParteBusqueda
    sexo: { id: 0, descripcion: p.sexo },
    tipoParte: { id: 0, descripcion: p.tipoParte },
    direccion: p.direccion,
    menorEdad: p.menorEdad,
  });

  const delitosRelacion: DelitoBusqueda[] = delitosSeleccionados.map((d) => ({
    id: Number(d.id),
    delito: {
      id: Number(d.id),
      descripcion: d.delito,
    },
  }));

  return {
    id: Date.now().toString(),
    procesado: mapearParteABusqueda(procesado),
    ofendido: mapearParteABusqueda(ofendido),
    delitosRelacion,
  };
}

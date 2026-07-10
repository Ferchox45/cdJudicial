import { Injectable, signal } from '@angular/core';
import { ModuloPantalla, Sala, Seccion } from '../models/permisos.types';

export interface AreaInfo {
  idArea: number;
  idAreaSistema: number;
  area: string;
}

export interface PerfilInfo {
  idSistemaPerfil: number;
  descripcion: string;
}

export interface SalaInfo {
  idSala: number;
  descripcion: string;
}

const STORAGE_KEY = 'permisos_data';

@Injectable({ providedIn: 'root' })
export class SessionStateService {
  idAreaSistemaUsuario = signal<number | null>(null);
  idPerfil = signal<number | null>(null);
  idPantalla = signal<number | null>(null);
  idSala = signal<number | null>(null);

  areaInfo = signal<AreaInfo | null>(null);
  perfilInfo = signal<PerfilInfo | null>(null);
  salaInfo = signal<SalaInfo | null>(null);
  modulosPantallas = signal<ModuloPantalla[]>([]);
  secciones = signal<Seccion[]>([]);
  salasDisponibles = signal<Sala[]>([]);

  permisosCompletados = signal(false);

  constructor() {
    this.restaurarSesion();
  }

  private restaurarSesion(): void {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.idAreaSistemaUsuario != null)
        this.idAreaSistemaUsuario.set(data.idAreaSistemaUsuario);
      if (data.idPerfil != null) this.idPerfil.set(data.idPerfil);
      if (data.idPantalla != null) this.idPantalla.set(data.idPantalla);
      if (data.idSala != null) this.idSala.set(data.idSala);
      if (data.areaInfo) this.areaInfo.set(data.areaInfo);
      if (data.perfilInfo) this.perfilInfo.set(data.perfilInfo);
      if (data.salaInfo) this.salaInfo.set(data.salaInfo);
      if (data.modulosPantallas) this.modulosPantallas.set(data.modulosPantallas);
      if (data.secciones) this.secciones.set(data.secciones);
      if (data.salasDisponibles) this.salasDisponibles.set(data.salasDisponibles);
      this.permisosCompletados.set(true);
    } catch {
      /* ignorar */
    }
  }

  private guardarSesion(): void {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        idAreaSistemaUsuario: this.idAreaSistemaUsuario(),
        idPerfil: this.idPerfil(),
        idPantalla: this.idPantalla(),
        idSala: this.idSala(),
        areaInfo: this.areaInfo(),
        perfilInfo: this.perfilInfo(),
        salaInfo: this.salaInfo(),
        modulosPantallas: this.modulosPantallas(),
        secciones: this.secciones(),
        salasDisponibles: this.salasDisponibles(),
      }),
    );
  }

  setArea(info: AreaInfo): void {
    this.areaInfo.set(info);
  }

  setAreaSistemaUsuario(id: number): void {
    this.idAreaSistemaUsuario.set(id);
  }

  setIdSala(id: number | null): void {
    this.idSala.set(id);
  }

  setSalaInfo(info: SalaInfo): void {
    this.salaInfo.set(info);
  }

  setSalasDisponibles(salas: Sala[]): void {
    this.salasDisponibles.set(salas);
  }

  setPerfil(info: PerfilInfo): void {
    this.perfilInfo.set(info);
    this.idPerfil.set(info.idSistemaPerfil);
  }

  setModulosPantallas(modulos: ModuloPantalla[]): void {
    this.modulosPantallas.set(modulos);
  }

  setSecciones(secciones: Seccion[]): void {
    this.secciones.set(secciones);
    this.guardarSesion();
  }

  tieneSeccion(descripcion: string): boolean {
    return this.secciones().some((s) => s.descripcion === descripcion && s.activo);
  }

  setPantalla(id: number): void {
    this.idPantalla.set(id);
    this.guardarSesion();
  }

  buscarPantallaPorDescripcion(descripcion: string): number | null {
    for (const modulo of this.modulosPantallas()) {
      for (const p of modulo.pantallas) {
        if (p.descripcion === descripcion) {
          return p.idPantalla;
        }
      }
    }
    return null;
  }

  completar(): void {
    this.permisosCompletados.set(true);
    this.guardarSesion();
  }

  reiniciar(): void {
    this.idAreaSistemaUsuario.set(null);
    this.idPerfil.set(null);
    this.idPantalla.set(null);
    this.idSala.set(null);
    this.areaInfo.set(null);
    this.perfilInfo.set(null);
    this.salaInfo.set(null);
    this.salasDisponibles.set([]);
    this.modulosPantallas.set([]);
    this.secciones.set([]);
    this.permisosCompletados.set(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

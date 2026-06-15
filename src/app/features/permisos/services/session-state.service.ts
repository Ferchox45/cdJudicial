import { Injectable, signal } from '@angular/core';
import { ModuloPantalla } from '../models/permisos.types';

export interface AreaInfo {
  idArea: number;
  idAreaSistema: number;
  area: string;
}

export interface PerfilInfo {
  idSistemaPerfil: number;
  descripcion: string;
}

const STORAGE_KEY = 'permisos_data';

@Injectable({ providedIn: 'root' })
export class SessionStateService {
  idAreaSistemaUsuario = signal<number | null>(null);
  idPerfil = signal<number | null>(null);
  idPantalla = signal<number | null>(null);

  areaInfo = signal<AreaInfo | null>(null);
  perfilInfo = signal<PerfilInfo | null>(null);
  modulosPantallas = signal<ModuloPantalla[]>([]);

  permisosCompletados = signal(false);

  constructor() {
    this.restaurarSesion();
  }

  private restaurarSesion(): void {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.idAreaSistemaUsuario != null) this.idAreaSistemaUsuario.set(data.idAreaSistemaUsuario);
      if (data.idPerfil != null) this.idPerfil.set(data.idPerfil);
      if (data.idPantalla != null) this.idPantalla.set(data.idPantalla);
      if (data.areaInfo) this.areaInfo.set(data.areaInfo);
      if (data.perfilInfo) this.perfilInfo.set(data.perfilInfo);
      if (data.modulosPantallas) this.modulosPantallas.set(data.modulosPantallas);
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
        areaInfo: this.areaInfo(),
        perfilInfo: this.perfilInfo(),
        modulosPantallas: this.modulosPantallas(),
      }),
    );
  }

  setArea(info: AreaInfo): void {
    this.areaInfo.set(info);
  }

  setAreaSistemaUsuario(id: number): void {
    this.idAreaSistemaUsuario.set(id);
  }

  setPerfil(info: PerfilInfo): void {
    this.perfilInfo.set(info);
    this.idPerfil.set(info.idSistemaPerfil);
  }

  setModulosPantallas(modulos: ModuloPantalla[]): void {
    this.modulosPantallas.set(modulos);
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
    this.areaInfo.set(null);
    this.perfilInfo.set(null);
    this.modulosPantallas.set([]);
    this.permisosCompletados.set(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

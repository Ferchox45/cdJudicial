import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  Area,
  ConfiguracionArea,
  ModuloPantalla,
  Seccion,
} from '../models/permisos.types';

@Injectable({ providedIn: 'root' })
export class PermisosService {
  private API = environment.apiUrl;
  private http = inject(HttpClient);

  getAreas(): Observable<Area[]> {
    return this.http
      .get<ApiResponse<Area[]>>(`${this.API}/api/permisos/areas`)
      .pipe(map((r) => r.data));
  }

  ingresar(idArea: number, idAreaSistema: number): Observable<ConfiguracionArea> {
    return this.http
      .post<ApiResponse<ConfiguracionArea>>(`${this.API}/api/permisos/ingresar`, {
        idArea,
        idAreaSistema,
      })
      .pipe(map((r) => r.data));
  }

  getModulosPantallas(dto: {
    idAreaSistemaUsuario: number;
    idPerfilUsuario: number;
  }): Observable<ModuloPantalla[]> {
    return this.http
      .post<ApiResponse<ModuloPantalla[]>>(`${this.API}/api/permisos/modulos-pantallas`, dto)
      .pipe(map((r) => r.data));
  }

  getSecciones(dto: {
    idAreaSistemaUsuario: number;
    idPantalla: number;
    idPerfil: number;
  }): Observable<Seccion[]> {
    return this.http
      .post<ApiResponse<Seccion[]>>(`${this.API}/api/permisos/secciones`, dto)
      .pipe(map((r) => r.data));
  }
}

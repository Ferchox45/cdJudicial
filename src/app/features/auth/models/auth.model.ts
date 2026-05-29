export interface LoginRequest {
  usuario: string;
  contrasenia: string;
  idSistema: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  errors: any;
  data: {
    access_token: string;
    refresh_token: string | null;
  };
}

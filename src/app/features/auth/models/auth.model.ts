export interface LoginRequest {
  usuario: string;
  contrasenia: string;
  idSistema: number; // Modifica el tipo (number o string) según lo requiera tu API
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

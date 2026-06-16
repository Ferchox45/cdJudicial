export interface LoginRequest {
  usuario: string;
  contrasenia: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: { access_token: string } | null;
}

export interface ProfileResponse {
  data: {
    nombre: string;
    foto: string;
  };
}

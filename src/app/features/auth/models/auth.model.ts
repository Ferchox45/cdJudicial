export interface LoginRequest {
  usuario: string;
  contrasenia: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: { access_token: string } | null;
}

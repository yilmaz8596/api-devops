export interface RegisterResponse {
  id: string | number | null;
  name: string | null;
  email: string | null;
  password?: string | null;
  role: string | null;
  createdAt: Date | null;
}

export interface LoginResponse {
  id: string | number | null;
  name: string | null;
  email: string | null;
  password?: string | null;
  role: string | null;
  createdAt: Date | null;
}

import { api } from "./api";

export interface LoginPayload {
  registration: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: string;
  name: string;
  role: string;
  city?: string;
  sector?: string;
}

export const authService = {
  checkRegistration: async (registration: string): Promise<{ name: string }> => {
    const { data } = await api.post<{ name: string }>(
      "/login/check-registration",
      { registration }
    );
    return data;
  },

  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/login", payload);
    return data;
  },
};
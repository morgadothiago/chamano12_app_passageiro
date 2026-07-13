import type { AuthSession, AuthUser, LoginCredentials, SignUpData } from "@/types/auth";
import { api } from "./api-client";

type ApiUser = { id: string; name: string; email: string; role: string; phone: string | null };

function mapUser(apiUser: ApiUser): AuthUser {
  return { id: apiUser.id, nome: apiUser.name, email: apiUser.email, phone: apiUser.phone };
}

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<AuthSession> {
    const result = await api.post<{ token: string; user: ApiUser }>("/auth/login", { email, password });
    return { user: mapUser(result.user), token: result.token };
  },

  async signUp(data: SignUpData): Promise<AuthSession> {
    const result = await api.post<{ token: string; user: ApiUser }>("/auth/register-passenger", {
      nome: data.nome,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
    return { user: mapUser(result.user), token: result.token };
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post<{ message: string }>("/auth/forgot-password", { email });
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    await api.post<{ message: string }>("/auth/reset-password", { email, code, newPassword });
  },

  async logout(): Promise<void> {
    // No-op com JWT stateless
  },
};

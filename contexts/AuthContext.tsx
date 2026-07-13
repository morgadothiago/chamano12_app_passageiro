import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";

import { authService } from "@/lib/auth";
import { getStoredJson, removeStored, setStoredJson, STORAGE_KEYS } from "@/lib/storage";
import type { AuthSession, AuthUser, LoginCredentials, SignUpData } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Diferente do motorista-app, o passageiro não tem cadeia de
 * aprovação/onboarding — a sessão persiste no AsyncStorage direto após
 * login bem-sucedido, sem etapa intermediária.
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getStoredJson<AuthSession>(STORAGE_KEYS.authSession);
      setSession(stored);
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const newSession = await authService.login(credentials);
    setSession(newSession);
    await setStoredJson(STORAGE_KEYS.authSession, newSession);
  }, []);

  const signUp = useCallback(async (data: SignUpData) => {
    // Cadastro só cria a conta — o passageiro precisa fazer login de fato
    // depois (mesmo padrão do motorista-app).
    await authService.signUp(data);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
    await removeStored(STORAGE_KEYS.authSession);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isLoading,
      isAuthenticated: Boolean(session),
      login,
      signUp,
      logout,
    }),
    [session, isLoading, login, signUp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

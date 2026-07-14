import { createContext, PropsWithChildren, useCallback, useEffect, useState } from "react";

import { passengerProfileService } from "@/lib/passenger-profile";
import type { PassengerProfile, UpdateAddressData } from "@/types/passenger-profile";
import { useAuth } from "@/hooks/use-auth";

type PassengerProfileContextValue = {
  profile: PassengerProfile | null;
  isLoading: boolean;
  isRegistrationCompleted: boolean;
  refresh: () => Promise<void>;
  submitEndereco: (data: UpdateAddressData) => Promise<void>;
};

export const PassengerProfileContext = createContext<PassengerProfileContextValue | null>(null);

/**
 * Espelha o `DriverRegistrationContext` do motorista-app: `isCompleted`
 * (aqui `isRegistrationCompleted`) é derivado direto de `GET /passengers/me`,
 * sem cache local — usado pelo guard raiz pra decidir se o passageiro cai em
 * `completar-cadastro` ou direto no mapa.
 */
export function PassengerProfileProvider({ children }: PropsWithChildren) {
  const { token, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<PassengerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await passengerProfileService.getMe(token);
      setProfile(data);
    } catch {
      // Falha na request (rede instável, timeout, 5xx) não significa que o
      // cadastro está incompleto — antes isso zerava `profile`, e como
      // `isRegistrationCompleted` deriva de `profile?.cadastroCompleto`, um
      // passageiro já cadastrado ficava preso na tela de completar-cadastro
      // (guard raiz em app/_layout.tsx) até a rede se recuperar e ele
      // reabrir o app. Mantém o último perfil conhecido em vez de descartar.
      setProfile((prev) => prev);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  const submitEndereco = useCallback(
    async (data: UpdateAddressData) => {
      if (!token) return;
      const updated = await passengerProfileService.updateMe(data, token);
      setProfile(updated);
    },
    [token],
  );

  return (
    <PassengerProfileContext.Provider
      value={{
        profile,
        isLoading,
        isRegistrationCompleted: profile?.cadastroCompleto ?? false,
        refresh,
        submitEndereco,
      }}
    >
      {children}
    </PassengerProfileContext.Provider>
  );
}

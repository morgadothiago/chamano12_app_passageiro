import { useEffect, useRef, useState } from "react";

import { fetchMotoristasProximos, type MotoristaProximo } from "@/lib/api-rides";
import { useAuth } from "@/hooks/use-auth";
import type { Coordenada } from "@/lib/routes";

const POLL_INTERVAL_MS = 6000;

/**
 * Busca motoristas online/disponíveis perto da origem, atualizando a cada
 * POLL_INTERVAL_MS enquanto a tela estiver com a localização resolvida.
 * Não usa websocket porque o backend só faz broadcast de localização de
 * motorista depois que uma corrida é aceita (`ride:driver-location`) — o
 * endpoint REST `/rides/nearby-drivers` é o único jeito de listar
 * motoristas ociosos no mapa antes de pedir corrida.
 */
export function useMotoristasProximos(origem: Coordenada | null) {
  const { token } = useAuth();
  const [motoristas, setMotoristas] = useState<MotoristaProximo[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!origem || !token) {
      setMotoristas([]);
      return;
    }

    let cancelado = false;

    const buscar = async () => {
      try {
        const resultado = await fetchMotoristasProximos(origem.latitude, origem.longitude, token);
        if (!cancelado) setMotoristas(resultado);
      } catch {
        // Falha silenciosa — não vale a pena um toast a cada 6s se a rede oscilar.
      }
    };

    buscar();
    intervalRef.current = setInterval(buscar, POLL_INTERVAL_MS);

    return () => {
      cancelado = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // Depende só de lat/lng (não do objeto `origem`, que é recriado a cada
    // atualização de GPS) — evita recriar o interval de polling a cada frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origem?.latitude, origem?.longitude, token]);

  return motoristas;
}

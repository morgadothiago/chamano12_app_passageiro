import { useEffect, useState } from "react";
import { TARIFA_PADRAO, type TarifaConfig } from "@/constants/tarifa";
import { fetchTarifa } from "@/lib/pricing";

/** Tarifa configurada no painel — cai pra `TARIFA_PADRAO` se a API falhar. */
export function useTarifa(): TarifaConfig {
  const [tarifa, setTarifa] = useState<TarifaConfig>(TARIFA_PADRAO);

  useEffect(() => {
    let isMounted = true;

    fetchTarifa().then((remota) => {
      if (isMounted && remota) setTarifa(remota);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return tarifa;
}

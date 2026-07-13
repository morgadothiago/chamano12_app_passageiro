import { useCallback, useState } from "react";

import { fetchAddressByCep } from "@/lib/viacep";
import type { ViaCepSuccessResponse } from "@/types/viacep";

type CepLookupState = {
  isLoading: boolean;
  error: string | null;
};

/**
 * Busca de endereço por CEP (loading/error) usada no formulário de
 * completar cadastro. Só dispara a busca quando o CEP tiver 8 dígitos.
 */
export function useCepLookup() {
  const [state, setState] = useState<CepLookupState>({ isLoading: false, error: null });

  const lookup = useCallback(async (cep: string): Promise<ViaCepSuccessResponse | null> => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      return null;
    }

    setState({ isLoading: true, error: null });
    try {
      const address = await fetchAddressByCep(digits);
      if (!address) {
        setState({ isLoading: false, error: "CEP não encontrado." });
        return null;
      }
      setState({ isLoading: false, error: null });
      return address;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar o CEP.";
      setState({ isLoading: false, error: message });
      return null;
    }
  }, []);

  return { ...state, lookup };
}

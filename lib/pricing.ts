import Constants from "expo-constants";
import type { TarifaConfig } from "@/constants/tarifa";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type PricingApiResponse = {
  success: boolean;
  data: {
    taxaBase: number;
    valorPorKm: number;
    valorPorMinuto: number;
    valorMinimo: number;
  };
};

/** Busca a tarifa padrão configurada no painel — sem autenticação (endpoint público). */
export async function fetchTarifa(): Promise<TarifaConfig | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/pricing`);
    if (!res.ok) return null;

    const body: PricingApiResponse = await res.json();
    return {
      taxaBase: body.data.taxaBase,
      valorPorKm: body.data.valorPorKm,
      valorPorMinuto: body.data.valorPorMinuto,
      valorMinimo: body.data.valorMinimo,
    };
  } catch {
    return null;
  }
}

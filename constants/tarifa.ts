export type TarifaConfig = {
  valorPorKm: number;
  valorPorMinuto: number;
  taxaBase: number;
  valorMinimo: number;
};

/**
 * Valores padrão usados enquanto não há uma fonte remota (dashboard web)
 * configurada. Quando o dashboard existir, a config passa a vir de lá e
 * estes valores servem só de fallback caso a busca remota falhe.
 */
export const TARIFA_PADRAO: TarifaConfig = {
  valorPorKm: 0.75,
  valorPorMinuto: 0.1,
  taxaBase: 3,
  valorMinimo: 4,
};

export const WHATSAPP_MOTORISTA = "+5561981209362";

export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

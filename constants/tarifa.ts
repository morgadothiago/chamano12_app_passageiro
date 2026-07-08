export const TARIFA = {
  valorPorKm: 0.75,
  valorPorMinuto: 0.1,
  taxaBase: 3,
  valorMinimo: 4,
} as const;

export const WHATSAPP_MOTORISTA = "+5561981209362";

export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

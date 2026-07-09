import { TARIFA_PADRAO, type TarifaConfig } from "@/constants/tarifa";

export function calcularValorCorrida(
  distanciaKm: number,
  duracaoMinutos: number,
  tarifa: TarifaConfig = TARIFA_PADRAO
) {
  const valorDistancia = tarifa.valorPorKm * distanciaKm;
  const valorTempo = tarifa.valorPorMinuto * Math.round(duracaoMinutos);
  const valorTotal = tarifa.taxaBase + valorDistancia + valorTempo;

  return Math.max(valorTotal, tarifa.valorMinimo);
}

import { TARIFA } from "@/constants/tarifa";

export function calcularValorCorrida(distanciaKm: number, duracaoMinutos: number) {
  const valorDistancia = TARIFA.valorPorKm * distanciaKm;
  const valorTempo = TARIFA.valorPorMinuto * Math.round(duracaoMinutos);
  const valorTotal = TARIFA.taxaBase + valorDistancia + valorTempo;

  return Math.max(valorTotal, TARIFA.valorMinimo);
}

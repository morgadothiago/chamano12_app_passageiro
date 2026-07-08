import { useCallback, useState } from "react";
import { calcularRota, type Coordenada } from "@/lib/routes";
import { calcularValorCorrida } from "@/lib/tarifa";

export type Estimativa = {
  distanciaKm: number;
  duracaoMinutos: number;
  valorEstimado: number;
  polilinha: string;
};

export function useEstimativaCorrida() {
  const [estimativa, setEstimativa] = useState<Estimativa | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const calcular = useCallback(async (origem: Coordenada, destino: Coordenada) => {
    setCarregando(true);
    setErro(null);

    try {
      const rota = await calcularRota(origem, destino);
      const valorEstimado = calcularValorCorrida(rota.distanciaKm, rota.duracaoMinutos);

      setEstimativa({
        distanciaKm: rota.distanciaKm,
        duracaoMinutos: rota.duracaoMinutos,
        valorEstimado,
        polilinha: rota.polilinha,
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao calcular estimativa.");
      setEstimativa(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  const limpar = useCallback(() => {
    setEstimativa(null);
    setErro(null);
  }, []);

  return { estimativa, carregando, erro, calcular, limpar };
}

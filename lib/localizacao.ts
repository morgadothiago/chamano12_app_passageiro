import * as Location from "expo-location";
import type { Coordenada } from "@/lib/routes";

export async function obterLocalizacaoAtual(): Promise<Coordenada> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Permissão de localização negada.");
  }

  const posicao = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: posicao.coords.latitude,
    longitude: posicao.coords.longitude,
  };
}

export async function geocodificarEndereco(endereco: string): Promise<Coordenada> {
  const resultados = await Location.geocodeAsync(endereco);
  const primeiro = resultados[0];

  if (!primeiro) {
    throw new Error(`Endereço não encontrado: ${endereco}`);
  }

  return { latitude: primeiro.latitude, longitude: primeiro.longitude };
}

export async function enderecoReverso(coordenada: Coordenada): Promise<string> {
  const [resultado] = await Location.reverseGeocodeAsync(coordenada);

  if (!resultado) {
    return `${coordenada.latitude}, ${coordenada.longitude}`;
  }

  return [resultado.street, resultado.streetNumber, resultado.city]
    .filter(Boolean)
    .join(", ");
}

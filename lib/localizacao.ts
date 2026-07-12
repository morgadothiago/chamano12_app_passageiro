import * as Location from "expo-location";
import { GOOGLE_MAPS_API_KEY } from "@/constants/tarifa";
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

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GeocodeResult = {
  address_components: AddressComponent[];
  formatted_address: string;
};

type GeocodeResponse = {
  status: string;
  results: GeocodeResult[];
};

export async function enderecoReverso(coordenada: Coordenada): Promise<string> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordenada.latitude},${coordenada.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar endereço.");
  }

  const data: GeocodeResponse = await response.json();

  if (data.status !== "OK" || !data.results?.length) {
    return `${coordenada.latitude}, ${coordenada.longitude}`;
  }

  const components = data.results[0].address_components;
  const getType = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name ?? "";

  const street = getType("route");
  const number = getType("street_number");
  const city = getType("locality");
  const state = getType("administrative_area_level_1");

  return [street, number, city, state].filter(Boolean).join(", ")
    || data.results[0].formatted_address;
}

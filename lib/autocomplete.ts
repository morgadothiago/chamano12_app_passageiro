import { GOOGLE_MAPS_API_KEY } from "@/constants/tarifa";
import type { Coordenada } from "@/lib/routes";

export type SugestaoLugar = {
  placeId: string;
  descricao: string;
};

type PlaceDetailsResponse = {
  location?: { latitude?: number; longitude?: number };
};

type PlacesAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
    };
  }>;
};

export async function buscarSugestoesLugar(
  texto: string,
  sinal?: AbortSignal
): Promise<SugestaoLugar[]> {
  const consulta = texto.trim();

  if (consulta.length < 3) {
    return [];
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      signal: sinal,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      },
      body: JSON.stringify({
        input: consulta,
        languageCode: "pt-BR",
        regionCode: "BR",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao buscar sugestões: ${response.statusText}`);
  }

  const data = (await response.json()) as PlacesAutocompleteResponse;

  return (data.suggestions ?? [])
    .map((sugestao) => ({
      placeId: sugestao.placePrediction?.placeId ?? "",
      descricao: sugestao.placePrediction?.text?.text ?? "",
    }))
    .filter((sugestao) => sugestao.placeId && sugestao.descricao);
}

export async function buscarCoordenadaDoLugar(placeId: string): Promise<Coordenada> {
  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": "location",
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar local: ${response.statusText}`);
  }

  const data = (await response.json()) as PlaceDetailsResponse;

  if (data.location?.latitude === undefined || data.location?.longitude === undefined) {
    throw new Error("Local sem coordenadas.");
  }

  return { latitude: data.location.latitude, longitude: data.location.longitude };
}

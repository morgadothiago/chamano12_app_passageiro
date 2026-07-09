import { GOOGLE_MAPS_API_KEY } from "@/constants/tarifa";

export type Coordenada = {
  latitude: number;
  longitude: number;
};

export type ResultadoRota = {
  distanciaKm: number;
  duracaoMinutos: number;
  polilinha: string;
};

type RoutesApiResponse = {
  routes?: Array<{
    duration?: string;
    distanceMeters?: number;
    polyline?: { encodedPolyline?: string };
  }>;
};

export async function calcularRota(
  origem: Coordenada,
  destino: Coordenada
): Promise<ResultadoRota> {
  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask":
          "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
      },
      body: JSON.stringify({
        origin: { location: { latLng: origem } },
        destination: { location: { latLng: destino } },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
        routeModifiers: {
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: false,
        },
        languageCode: "pt-BR",
        units: "METRIC",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao calcular rota: ${response.statusText}`);
  }

  const data = (await response.json()) as RoutesApiResponse;
  const rota = data.routes?.[0];

  if (!rota) {
    throw new Error("Nenhuma rota encontrada.");
  }

  const duracaoSegundos = Number(rota.duration?.replace("s", ""));
  const encodedPolyline = rota.polyline?.encodedPolyline;

  if (
    !Number.isFinite(duracaoSegundos) ||
    !Number.isFinite(rota.distanceMeters) ||
    !encodedPolyline
  ) {
    throw new Error("Resposta de rota inválida.");
  }

  return {
    distanciaKm: rota.distanceMeters! / 1000,
    duracaoMinutos: duracaoSegundos / 60,
    polilinha: encodedPolyline,
  };
}

import { api } from "./api-client";

export type MotoristaProximo = {
  driverId: string;
  driverName: string;
  vehicle: string;
  lat: number;
  lng: number;
  status: "available" | "busy";
  distanciaKm: number;
};

export async function fetchMotoristasProximos(
  lat: number,
  lng: number,
  token: string,
  radiusKm = 5,
): Promise<MotoristaProximo[]> {
  return api.get<MotoristaProximo[]>(
    `/rides/nearby-drivers?lat=${lat}&lng=${lng}&radius=${radiusKm}`,
    token,
  );
}

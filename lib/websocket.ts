import Constants from "expo-constants";
import { io, Socket } from "socket.io-client";
import { getStoredJson, setStoredJson, STORAGE_KEYS } from "./storage";

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

let socket: Socket | null = null;
let deviceId: string | null = null;

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * Persistido no AsyncStorage — antes era gerado do zero a cada abertura do
 * app, então o backend nunca conseguia associar o passageiro a uma corrida
 * já existente depois de fechar/reabrir (ver `passenger:get-active-ride`).
 */
export async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId;

  const stored = await getStoredJson<string>(STORAGE_KEYS.deviceId);
  if (stored) {
    deviceId = stored;
    return deviceId;
  }

  deviceId = generateId();
  await setStoredJson(STORAGE_KEYS.deviceId, deviceId);
  return deviceId;
}

export async function connect(): Promise<Socket> {
  if (socket?.connected) return socket;

  const id = await getDeviceId();
  socket = io(`${API_URL}/ws`, {
    query: { deviceId: id },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[WS] Conectado como passageiro:", id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[WS] Desconectado:", reason);
  });

  socket.on("error", (err) => {
    console.error("[WS] Erro:", err);
  });

  return socket;
}

export function disconnect(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

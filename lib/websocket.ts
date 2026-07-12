import Constants from "expo-constants";
import { io, Socket } from "socket.io-client";

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

let socket: Socket | null = null;
let deviceId: string | null = null;

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getDeviceId(): string {
  if (!deviceId) deviceId = generateId();
  return deviceId;
}

export function connect(): Socket {
  if (socket?.connected) return socket;

  const id = getDeviceId();
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

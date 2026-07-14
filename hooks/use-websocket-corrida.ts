import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import Toast from "react-native-toast-message";
import { connect, disconnect, getSocket } from "@/lib/websocket";
import type { Coordenada } from "@/lib/routes";
import type { ChatMessage, FormaPagamento } from "@/types/ride";

export type RideStatus =
  | "idle"
  | "searching"
  | "accepted"
  | "started"
  | "completed"
  | "cancelled"
  | "no_drivers"
  | "timed_out";

export type RideState = {
  status: RideStatus;
  rideId: string | null;
  driverId: string | null;
  driverName: string | null;
  vehicle: string | null;
  driverLocation: Coordenada | null;
  distanciaKm: number | null;
  valorFinal: number | null;
  formaPagamentoFinal: FormaPagamento | null;
  // Só preenchidos ao restaurar uma corrida ativa via
  // `passenger:get-active-ride` (ver `handleActiveRide`) — o fluxo normal de
  // pedir corrida já tem esse texto no estado local de `useEnderecosCorrida`,
  // então esses campos servem de fallback pra tela não mostrar "Origem"/
  // "Destino" em branco depois que o passageiro fecha e reabre o app com uma
  // corrida em andamento.
  origem: string | null;
  destino: string | null;
  error: string | null;
};

type RequestRideParams = {
  passengerName: string;
  origem: string;
  origemLat: number;
  origemLng: number;
  destino: string;
  destinoLat: number;
  destinoLng: number;
  distanciaKm: number;
  valor: number;
  formaPagamento: FormaPagamento;
};

export function useWebsocketCorrida() {
  const [state, setState] = useState<RideState>({
    status: "idle",
    rideId: null,
    driverId: null,
    driverName: null,
    vehicle: null,
    driverLocation: null,
    distanciaKm: null,
    valorFinal: null,
    formaPagamentoFinal: null,
    origem: null,
    destino: null,
    error: null,
  });
  const [connected, setConnected] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    let cancelado = false;

    const handleAccepted = (data: {
      rideId: string;
      driverId: string;
      driverName: string;
      vehicle: string;
      lat: number;
      lng: number;
    }) => {
      setChatMessages([]);
      setState((prev) => ({
        ...prev,
        status: "accepted",
        rideId: data.rideId,
        driverId: data.driverId,
        driverName: data.driverName,
        vehicle: data.vehicle,
        driverLocation: { latitude: data.lat, longitude: data.lng },
      }));
    };

    const handleDriverLocation = (data: { lat: number; lng: number }) => {
      setState((prev) => ({
        ...prev,
        driverLocation: { latitude: data.lat, longitude: data.lng },
      }));
    };

    const handleStarted = (data: { rideId: string }) => {
      setState((prev) => ({ ...prev, status: "started" }));
    };

    const handleCompleted = (data: { rideId: string; valor: number; formaPagamento: FormaPagamento }) => {
      setState((prev) => ({
        ...prev,
        status: "completed",
        valorFinal: data.valor,
        formaPagamentoFinal: data.formaPagamento,
      }));
    };

    const handleCancelled = (data: { rideId: string; canceladoPor: string; motivo?: string }) => {
      setState((prev) => ({ ...prev, status: "cancelled" }));
    };

    const handleNoDrivers = (data: { rideId: string }) => {
      setState((prev) => ({ ...prev, status: "no_drivers" }));
    };

    const handleTimedOut = (data: { rideId: string }) => {
      setState((prev) => ({ ...prev, status: "timed_out" }));
    };

    const handleChatMessage = (data: ChatMessage) => {
      if (stateRef.current.rideId === data.rideId) {
        setChatMessages((prev) => [...prev, data]);
      }
    };

    // Sem isso, qualquer rejeição do backend (ex.: "você já possui uma
    // corrida em andamento") ficava muda pro passageiro — a tela continuava
    // em "Buscando motorista..." pra sempre, sem nenhum aviso do motivo.
    const handleException = (err: { message?: string } | string) => {
      if (stateRef.current.status !== "searching") return;
      setState((prev) => ({ ...prev, status: "idle" }));
      Toast.show({
        type: "error",
        text1: "Não foi possível pedir a corrida",
        text2: typeof err === "string" ? err : err?.message,
      });
    };

    // Restaura a corrida em andamento ao reabrir o app — sem isso o
    // passageiro sempre caía na tela de "pedir corrida" do zero mesmo com
    // uma corrida aceita/iniciada rolando.
    const handleActiveRide = (
      data: {
        rideId: string;
        status: "accepted" | "started";
        driverId: string;
        driverName: string;
        vehicle: string;
        origem: string;
        destino: string;
        valor: number;
        distanciaKm: number | null;
        formaPagamento: FormaPagamento;
      } | null,
    ) => {
      if (!data) return;
      setState((prev) => ({
        ...prev,
        status: data.status,
        rideId: data.rideId,
        driverId: data.driverId,
        driverName: data.driverName,
        vehicle: data.vehicle,
        distanciaKm: data.distanciaKm,
        origem: data.origem,
        destino: data.destino,
      }));
    };

    let socketRef: Socket | null = null;

    connect().then((socket) => {
      if (cancelado) return;
      socketRef = socket;

      setConnected(socket.connected);

      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));

      socket.on("ride:accepted", handleAccepted);
      socket.on("ride:driver-location", handleDriverLocation);
      socket.on("ride:started", handleStarted);
      socket.on("ride:completed", handleCompleted);
      socket.on("ride:cancelled", handleCancelled);
      socket.on("ride:no-drivers-nearby", handleNoDrivers);
      socket.on("ride:timed-out", handleTimedOut);
      socket.on("chat:new-message", handleChatMessage);
      socket.on("passenger:active-ride", handleActiveRide);
      socket.on("exception", handleException);

      socket.emit("passenger:get-active-ride");
    });

    return () => {
      cancelado = true;
      if (!socketRef) return;
      socketRef.off("ride:accepted", handleAccepted);
      socketRef.off("ride:driver-location", handleDriverLocation);
      socketRef.off("ride:started", handleStarted);
      socketRef.off("ride:completed", handleCompleted);
      socketRef.off("ride:cancelled", handleCancelled);
      socketRef.off("ride:no-drivers-nearby", handleNoDrivers);
      socketRef.off("ride:timed-out", handleTimedOut);
      socketRef.off("chat:new-message", handleChatMessage);
      socketRef.off("passenger:active-ride", handleActiveRide);
      socketRef.off("exception", handleException);
    };
  }, []);

  const requestRide = useCallback(
    (params: RequestRideParams) => {
      const socket = getSocket();
      if (!socket?.connected) {
        Toast.show({ type: "error", text1: "Sem conexão com o servidor", text2: "Tente novamente em instantes." });
        return;
      }

      setState({
        status: "searching",
        rideId: null,
        driverId: null,
        driverName: null,
        vehicle: null,
        driverLocation: null,
        distanciaKm: params.distanciaKm,
        valorFinal: null,
        formaPagamentoFinal: null,
        origem: params.origem,
        destino: params.destino,
        error: null,
      });

      socket.emit("passenger:request-ride", params);
    },
    [],
  );

  const cancelRide = useCallback(() => {
    const socket = getSocket();
    const rideId = stateRef.current.rideId;
    if (!socket || !rideId) return;

    socket.emit("ride:cancel", { rideId });
    setState((prev) => ({ ...prev, status: "cancelled" }));
  }, []);

  const reset = useCallback(() => {
    setState({
      status: "idle",
      rideId: null,
      driverId: null,
      driverName: null,
      vehicle: null,
      driverLocation: null,
      distanciaKm: null,
      valorFinal: null,
      formaPagamentoFinal: null,
      origem: null,
      destino: null,
      error: null,
    });
    setChatMessages([]);
  }, []);

  const sendChatMessage = useCallback((texto: string) => {
    const socket = getSocket();
    const rideId = stateRef.current.rideId;
    if (!socket || !rideId || !texto.trim()) return;

    socket.emit("chat:send-message", { rideId, texto: texto.trim() });
  }, []);

  return { state, chatMessages, sendChatMessage, requestRide, cancelRide, reset, connected };
}

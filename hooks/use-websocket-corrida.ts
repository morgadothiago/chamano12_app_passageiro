import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { connect, disconnect, getSocket } from "@/lib/websocket";
import type { Coordenada } from "@/lib/routes";

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
};

export function useWebsocketCorrida() {
  const [state, setState] = useState<RideState>({
    status: "idle",
    rideId: null,
    driverId: null,
    driverName: null,
    vehicle: null,
    driverLocation: null,
    error: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const socket = connect();

    const handleAccepted = (data: {
      rideId: string;
      driverId: string;
      driverName: string;
      vehicle: string;
      lat: number;
      lng: number;
    }) => {
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

    const handleCompleted = (data: { rideId: string }) => {
      setState((prev) => ({ ...prev, status: "completed" }));
      Alert.alert("Corrida finalizada", "Obrigado por viajar conosco!");
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

    socket.on("ride:accepted", handleAccepted);
    socket.on("ride:driver-location", handleDriverLocation);
    socket.on("ride:started", handleStarted);
    socket.on("ride:completed", handleCompleted);
    socket.on("ride:cancelled", handleCancelled);
    socket.on("ride:no-drivers-nearby", handleNoDrivers);
    socket.on("ride:timed-out", handleTimedOut);

    return () => {
      socket.off("ride:accepted", handleAccepted);
      socket.off("ride:driver-location", handleDriverLocation);
      socket.off("ride:started", handleStarted);
      socket.off("ride:completed", handleCompleted);
      socket.off("ride:cancelled", handleCancelled);
      socket.off("ride:no-drivers-nearby", handleNoDrivers);
      socket.off("ride:timed-out", handleTimedOut);
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
      error: null,
    });
  }, []);

  return { state, requestRide, cancelRide, reset };
}

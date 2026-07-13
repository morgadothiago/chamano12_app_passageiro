import { useContext } from "react";

import { PassengerProfileContext } from "@/contexts/PassengerProfileContext";

export function usePassengerProfile() {
  const context = useContext(PassengerProfileContext);
  if (!context) {
    throw new Error("usePassengerProfile deve ser usado dentro de um PassengerProfileProvider.");
  }
  return context;
}

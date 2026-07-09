import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export function useTecladoAtivo() {
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    const mostrar = Keyboard.addListener("keyboardDidShow", () => setAtivo(true));
    const esconder = Keyboard.addListener("keyboardDidHide", () => setAtivo(false));

    return () => {
      mostrar.remove();
      esconder.remove();
    };
  }, []);

  return ativo;
}

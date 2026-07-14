import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { isNetworkError as checkNetworkError } from "@/utils/error-utils";

type ErrorState = {
  visible: boolean;
  title: string;
  message: string;
};

type UseErrorHandlerOptions = {
  onRetry?: () => void;
};

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { onRetry } = options;
  const [error, setError] = useState<ErrorState>({ visible: false, title: "", message: "" });
  const onRetryRef = useRef(onRetry);
  onRetryRef.current = onRetry;

  const showError = useCallback((title: string, message?: string) => {
    console.error("[AppError]", title, message ?? "");
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
    });
    setError({ visible: true, title, message: message ?? "" });
  }, []);

  const hideError = useCallback(() => {
    setError({ visible: false, title: "", message: "" });
  }, []);

  const showCriticalError = useCallback((title: string, message?: string) => {
    console.error("[AppError][Critical]", title, message ?? "");
    Alert.alert(title, message);
    setError({ visible: true, title, message: message ?? "" });
  }, []);

  const showBlockingError = useCallback(
    (title: string, message?: string) => {
      console.error("[AppError][Blocking]", title, message ?? "");
      Alert.alert(title, message, [
        { text: "Tentar novamente", onPress: () => onRetryRef.current?.() },
        { text: "Cancelar", style: "cancel" },
      ]);
      setError({ visible: true, title, message: message ?? "" });
    },
    [],
  );

  return {
    error,
    showError,
    hideError,
    showCriticalError,
    showBlockingError,
    isNetworkError: checkNetworkError,
  };
}

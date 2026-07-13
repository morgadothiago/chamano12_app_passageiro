import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

import { passengerProfileService } from "@/lib/passenger-profile";
import { useAuth } from "@/hooks/use-auth";
import { usePassengerProfile } from "@/hooks/use-passenger-profile";

function inferFileName(uri: string): string {
  const extMatch = uri.match(/\.(\w+)$/);
  const ext = extMatch ? extMatch[1] : "jpg";
  return `avatar.${ext}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const UPLOAD_RETRY_ATTEMPTS = 3;
const UPLOAD_RETRY_DELAY_MS = 2000;

/**
 * A API roda no plano free do Render, que "dorme" após 15min sem uso — a
 * primeira request depois disso pode cair com "Network request failed"
 * enquanto o servidor acorda (até ~50s). Reenvia automaticamente em vez de
 * obrigar o usuário a escolher a foto de novo (mesmo padrão do
 * useDocumentUpload.ts do motorista-app).
 */
async function uploadWithRetry(
  ...args: Parameters<typeof passengerProfileService.uploadAvatar>
): ReturnType<typeof passengerProfileService.uploadAvatar> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= UPLOAD_RETRY_ATTEMPTS; attempt++) {
    try {
      return await passengerProfileService.uploadAvatar(...args);
    } catch (error) {
      lastError = error;
      if (attempt < UPLOAD_RETRY_ATTEMPTS) await delay(UPLOAD_RETRY_DELAY_MS);
    }
  }
  throw lastError;
}

async function pickImage(fromCamera: boolean): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      "Permissão necessária",
      fromCamera
        ? "Precisamos da câmera para tirar sua foto."
        : "Precisamos acessar suas fotos para trocar o avatar.",
    );
    return null;
  }

  // Sem `allowsEditing`/crop nativo de propósito: em alguns devices a tela
  // de crop do Android renderiza com letterboxing e o botão de confirmar
  // (CROP) fica cortado/inacessível — provável conflito com a barra de
  // navegação escondida globalmente (`expo-navigation-bar`, ver
  // app/_layout.tsx). O avatar já é recortado em círculo na exibição
  // (`perfil.tsx`), então o crop na origem não é necessário.
  const result = fromCamera
    ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });

  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0];
}

export function useAvatarUpload() {
  const { token } = useAuth();
  const { refresh } = usePassengerProfile();
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (fromCamera: boolean) => {
      if (!token) return;

      const asset = await pickImage(fromCamera);
      if (!asset) return;

      setIsUploading(true);
      try {
        await uploadWithRetry(
          { uri: asset.uri, name: inferFileName(asset.uri), mimeType: asset.mimeType ?? "image/jpeg" },
          token,
        );
        await refresh();
        Toast.show({ type: "success", text1: "Foto atualizada!" });
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Não foi possível enviar a foto",
          text2: error instanceof Error ? error.message : "Tente novamente.",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [token, refresh],
  );

  return { upload, isUploading };
}

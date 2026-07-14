import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  authSession: "@chama12/passageiro/auth-session",
  deviceId: "@chama12/passageiro/device-id",
} as const;

export async function getStoredJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setStoredJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeStored(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

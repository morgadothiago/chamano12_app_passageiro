import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}/api/v1${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await res.json();

  if (!res.ok) {
    const error = body.error ?? body.message ?? "Erro desconhecido";
    const message = typeof error === "string" ? error : error.message ?? JSON.stringify(error);
    throw new ApiError(message, res.status, error.code);
  }

  return body.data;
}

async function requestFormData<T>(path: string, formData: FormData, token?: string): Promise<T> {
  const url = `${API_URL}/api/v1${path}`;

  // Sem "Content-Type" manual — o fetch define multipart/form-data com o boundary correto sozinho.
  const res = await fetch(url, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const body = await res.json();

  if (!res.ok) {
    const error = body.error ?? body.message ?? "Erro desconhecido";
    const message = typeof error === "string" ? error : error.message ?? JSON.stringify(error);
    throw new ApiError(message, res.status, error.code);
  }

  return body.data;
}

export const api = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  post: <T>(path: string, data?: unknown, token?: string) =>
    request<T>(path, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  patch: <T>(path: string, data: unknown, token?: string) =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  postFormData: <T>(path: string, formData: FormData, token?: string) =>
    requestFormData<T>(path, formData, token),
};

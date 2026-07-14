export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  if (error instanceof Error) return error.message;

  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === "string") return msg;
  }

  if (error && typeof error === "object" && "error" in error) {
    const msg = (error as { error: unknown }).error;
    if (typeof msg === "string") return msg;
    if (typeof msg === "object" && msg && "message" in (msg as object)) {
      const inner = (msg as { message: unknown }).message;
      if (typeof inner === "string") return inner;
    }
  }

  return "Ocorreu um erro inesperado.";
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === "Network request failed") {
    return true;
  }

  const msg = getErrorMessage(error).toLowerCase();
  return (
    msg.includes("network") ||
    msg.includes("conexão") ||
    msg.includes("conexao") ||
    msg.includes("timeout") ||
    msg.includes("econnrefused") ||
    msg.includes("econnreset") ||
    msg.includes("enotfound") ||
    msg.includes("socket") ||
    msg.includes("sem conexão") ||
    msg.includes("sem conexao") ||
    msg.includes("não foi possível conectar") ||
    msg.includes("nao foi possivel conectar") ||
    msg.includes("internet") ||
    msg.includes("offline")
  );
}

export function isAuthError(error: unknown): boolean {
  const msg = getErrorMessage(error).toLowerCase();
  return (
    msg.includes("unauthorized") ||
    msg.includes("não autorizado") ||
    msg.includes("nao autorizado") ||
    msg.includes("token") ||
    msg.includes("session expired") ||
    msg.includes("sessão expirada") ||
    msg.includes("sessao expirada") ||
    msg.includes("login") ||
    msg.includes("autenticação") ||
    msg.includes("autenticacao") ||
    msg.includes("credenciais") ||
    msg.includes("permissão") ||
    msg.includes("permissao") ||
    msg.includes("forbidden") ||
    msg.includes("401") ||
    msg.includes("403")
  );
}

import type { ViaCepResponse, ViaCepSuccessResponse } from "@/types/viacep";

/** Integração real com a API pública ViaCEP: https://viacep.com.br/ws/{cep}/json/ */
export async function fetchAddressByCep(cep: string): Promise<ViaCepSuccessResponse | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) {
    throw new Error("CEP deve conter 8 dígitos.");
  }

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP agora.");
  }

  const data = (await response.json()) as ViaCepResponse;
  if ("erro" in data && data.erro) {
    return null;
  }

  return data as ViaCepSuccessResponse;
}

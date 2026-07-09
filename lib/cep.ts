const REGEX_CEP = /^\d{5}-?\d{3}$/;

type RespostaViaCep = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

const REGEX_DIGITACAO_CEP = /^\d{0,5}-?\d{0,3}$/;

export function isCep(texto: string): boolean {
  return REGEX_CEP.test(texto.trim());
}

/**
 * Aplica máscara "00000-000" enquanto o usuário digita um CEP. Só mexe no
 * texto se ele já se parece com dígitos de CEP em progresso (senão deixa
 * nomes de rua intactos, já que aceitam qualquer caractere).
 */
export function mascararCep(texto: string): string {
  if (!REGEX_DIGITACAO_CEP.test(texto)) {
    return texto;
  }

  const digitos = texto.replace(/\D/g, "").slice(0, 8);

  if (digitos.length <= 5) {
    return digitos;
  }

  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

function normalizarCep(cep: string): string {
  return cep.trim().replace(/\D/g, "");
}

export async function buscarEnderecoPorCep(cep: string): Promise<string> {
  if (!isCep(cep)) {
    throw new Error(`CEP inválido: ${cep}`);
  }

  const cepNormalizado = normalizarCep(cep);

  const response = await fetch(`https://viacep.com.br/ws/${cepNormalizado}/json/`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar CEP: ${response.statusText}`);
  }

  const data = (await response.json()) as RespostaViaCep;

  if (data.erro) {
    throw new Error(`CEP não encontrado: ${cep}`);
  }

  const endereco = [data.logradouro, data.bairro, data.localidade && data.uf ? `${data.localidade} - ${data.uf}` : data.localidade]
    .filter(Boolean)
    .join(", ");

  if (!endereco) {
    throw new Error(`Endereço não encontrado para o CEP: ${cep}`);
  }

  return endereco;
}

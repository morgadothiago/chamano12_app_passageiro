import { buscarEnderecoPorCep, isCep, mascararCep } from "@/lib/cep";

describe("mascararCep", () => {
  it("não mexe em texto curto", () => {
    expect(mascararCep("7")).toBe("7");
    expect(mascararCep("700")).toBe("700");
  });

  it("insere hífen após o 5º dígito", () => {
    expect(mascararCep("700001")).toBe("70000-1");
    expect(mascararCep("70000000")).toBe("70000-000");
  });

  it("mantém a máscara ao apagar um dígito", () => {
    expect(mascararCep("70000-00")).toBe("70000-00");
  });

  it("não mexe em nome de rua", () => {
    expect(mascararCep("Rua das Flores, 123")).toBe("Rua das Flores, 123");
  });
});

describe("isCep", () => {
  it("aceita CEP com hífen", () => {
    expect(isCep("70000-000")).toBe(true);
  });

  it("aceita CEP sem hífen", () => {
    expect(isCep("70000000")).toBe(true);
  });

  it("aceita CEP com espaços nas bordas", () => {
    expect(isCep("  70000-000  ")).toBe(true);
  });

  it("rejeita texto livre (rua/endereço)", () => {
    expect(isCep("Rua das Flores, 123")).toBe(false);
  });

  it("rejeita quantidade errada de dígitos", () => {
    expect(isCep("7000-000")).toBe(false);
    expect(isCep("700000000")).toBe(false);
  });

  it("rejeita string vazia", () => {
    expect(isCep("")).toBe(false);
  });
});

describe("buscarEnderecoPorCep", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("retorna endereço formatado quando o CEP é encontrado", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        logradouro: "SBS Quadra 1",
        bairro: "Setor Bancário Sul",
        localidade: "Brasília",
        uf: "DF",
      }),
    }) as unknown as typeof fetch;

    const endereco = await buscarEnderecoPorCep("70000-000");

    expect(endereco).toBe("SBS Quadra 1, Setor Bancário Sul, Brasília - DF");
    expect(global.fetch).toHaveBeenCalledWith("https://viacep.com.br/ws/70000000/json/");
  });

  it("omite partes vazias/ausentes do endereço", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        logradouro: "",
        bairro: "Centro",
        localidade: "Brasília",
        uf: "DF",
      }),
    }) as unknown as typeof fetch;

    const endereco = await buscarEnderecoPorCep("70000000");

    expect(endereco).toBe("Centro, Brasília - DF");
  });

  it("lança erro quando o CEP não é encontrado (ViaCEP retorna erro: true)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ erro: true }),
    }) as unknown as typeof fetch;

    await expect(buscarEnderecoPorCep("99999-999")).rejects.toThrow("CEP não encontrado");
  });

  it("lança erro quando o CEP está mal formatado", async () => {
    await expect(buscarEnderecoPorCep("123")).rejects.toThrow("CEP inválido");
  });

  it("lança erro quando a requisição HTTP falha", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
    }) as unknown as typeof fetch;

    await expect(buscarEnderecoPorCep("70000-000")).rejects.toThrow("Erro ao buscar CEP");
  });

  it("lança erro quando a rede falha", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network request failed"));

    await expect(buscarEnderecoPorCep("70000-000")).rejects.toThrow("Network request failed");
  });
});

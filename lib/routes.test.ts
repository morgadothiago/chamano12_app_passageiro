import { calcularRota } from "@/lib/routes";

const origem = { latitude: -15.79, longitude: -47.88 };
const destino = { latitude: -15.8, longitude: -47.9 };

describe("calcularRota", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("retorna distância, duração e polilinha quando a resposta é válida", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        routes: [
          {
            duration: "120s",
            distanceMeters: 5000,
            polyline: { encodedPolyline: "abc123" },
          },
        ],
      }),
    }) as unknown as typeof fetch;

    const resultado = await calcularRota(origem, destino);

    expect(resultado).toEqual({
      distanciaKm: 5,
      duracaoMinutos: 2,
      polilinha: "abc123",
    });
  });

  it("lança erro quando a requisição HTTP falha", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: "Forbidden",
    }) as unknown as typeof fetch;

    await expect(calcularRota(origem, destino)).rejects.toThrow("Erro ao calcular rota");
  });

  it("lança erro quando não há rotas na resposta", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ routes: [] }),
    }) as unknown as typeof fetch;

    await expect(calcularRota(origem, destino)).rejects.toThrow("Nenhuma rota encontrada");
  });

  it("lança erro quando a resposta vem sem duration/polyline (formato inesperado)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        routes: [{ distanceMeters: 5000 }],
      }),
    }) as unknown as typeof fetch;

    await expect(calcularRota(origem, destino)).rejects.toThrow("Resposta de rota inválida");
  });
});

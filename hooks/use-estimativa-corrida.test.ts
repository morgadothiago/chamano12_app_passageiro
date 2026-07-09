import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useEstimativaCorrida } from "@/hooks/use-estimativa-corrida";
import { calcularRota } from "@/lib/routes";

jest.mock("@/lib/routes", () => ({
  calcularRota: jest.fn(),
}));

const origem = { latitude: -15.79, longitude: -47.88 };
const destino = { latitude: -15.8, longitude: -47.9 };

describe("useEstimativaCorrida", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calcula e expõe a estimativa em caso de sucesso", async () => {
    (calcularRota as jest.Mock).mockResolvedValue({
      distanciaKm: 5,
      duracaoMinutos: 10,
      polilinha: "abc",
    });

    const { result } = renderHook(() => useEstimativaCorrida());

    await act(async () => {
      await result.current.calcular(origem, destino);
    });

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.erro).toBeNull();
    expect(result.current.estimativa).toEqual({
      distanciaKm: 5,
      duracaoMinutos: 10,
      valorEstimado: expect.any(Number),
      polilinha: "abc",
    });
  });

  it("expõe o erro e limpa a estimativa quando o cálculo falha", async () => {
    (calcularRota as jest.Mock).mockRejectedValue(new Error("Erro ao calcular rota: Forbidden"));

    const { result } = renderHook(() => useEstimativaCorrida());

    await act(async () => {
      await expect(result.current.calcular(origem, destino)).rejects.toThrow(
        "Erro ao calcular rota: Forbidden"
      );
    });

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.estimativa).toBeNull();
    expect(result.current.erro).toBe("Erro ao calcular rota: Forbidden");
  });

  it("limpar() reseta estimativa e erro", async () => {
    (calcularRota as jest.Mock).mockResolvedValue({
      distanciaKm: 5,
      duracaoMinutos: 10,
      polilinha: "abc",
    });

    const { result } = renderHook(() => useEstimativaCorrida());

    await act(async () => {
      await result.current.calcular(origem, destino);
    });
    await waitFor(() => expect(result.current.estimativa).not.toBeNull());

    act(() => {
      result.current.limpar();
    });

    expect(result.current.estimativa).toBeNull();
    expect(result.current.erro).toBeNull();
  });
});

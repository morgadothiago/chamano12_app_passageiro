import { calcularValorCorrida } from "@/lib/tarifa";

describe("calcularValorCorrida", () => {
  it("soma taxa base, distância e tempo", () => {
    // taxaBase 3 + (0.75 * 10) + (0.1 * 20) = 3 + 7.5 + 2 = 12.5
    expect(calcularValorCorrida(10, 20)).toBeCloseTo(12.5);
  });

  it("aplica o valor mínimo quando o cálculo fica abaixo dele", () => {
    expect(calcularValorCorrida(0, 0)).toBe(4);
  });

  it("arredonda a duração antes de multiplicar pelo valor por minuto", () => {
    // taxaBase 3 + (0.75 * 1) + (0.1 * round(2.6)=3) = 3 + 0.75 + 0.3 = 4.05
    expect(calcularValorCorrida(1, 2.6)).toBeCloseTo(4.05);
  });
});

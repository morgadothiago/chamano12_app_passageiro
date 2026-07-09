import { decodificarPolilinha } from "@/lib/polilinha";

describe("decodificarPolilinha", () => {
  it("decodifica uma polilinha conhecida do Google", () => {
    // Exemplo oficial da documentação do Google Maps Polyline Algorithm
    const resultado = decodificarPolilinha("_p~iF~ps|U_ulLnnqC_mqNvxq`@");

    expect(resultado).toEqual([
      { latitude: 38.5, longitude: -120.2 },
      { latitude: 40.7, longitude: -120.95 },
      { latitude: 43.252, longitude: -126.453 },
    ]);
  });

  it("retorna array vazio para string vazia", () => {
    expect(decodificarPolilinha("")).toEqual([]);
  });
});

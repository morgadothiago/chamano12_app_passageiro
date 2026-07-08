import type { Coordenada } from "@/lib/routes";

export function decodificarPolilinha(codificada: string): Coordenada[] {
  let indice = 0;
  let lat = 0;
  let lng = 0;
  const coordenadas: Coordenada[] = [];

  while (indice < codificada.length) {
    let resultado = 0;
    let deslocamento = 0;
    let byte: number;

    do {
      byte = codificada.charCodeAt(indice++) - 63;
      resultado |= (byte & 0x1f) << deslocamento;
      deslocamento += 5;
    } while (byte >= 0x20);
    lat += resultado & 1 ? ~(resultado >> 1) : resultado >> 1;

    resultado = 0;
    deslocamento = 0;
    do {
      byte = codificada.charCodeAt(indice++) - 63;
      resultado |= (byte & 0x1f) << deslocamento;
      deslocamento += 5;
    } while (byte >= 0x20);
    lng += resultado & 1 ? ~(resultado >> 1) : resultado >> 1;

    coordenadas.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return coordenadas;
}

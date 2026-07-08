import { Linking } from "react-native";
import { WHATSAPP_MOTORISTA } from "@/constants/tarifa";
import type { Coordenada } from "@/lib/routes";

type DadosCorrida = {
  nome: string;
  enderecoOrigem: string;
  origem: Coordenada;
  enderecoDestino: string;
  destino: Coordenada;
  valorEstimado: number;
};

export function abrirWhatsappMotorista(dados: DadosCorrida) {
  const valorFormatado = dados.valorEstimado.toFixed(2).replace(".", ",");

  const mensagem = [
    "Olá!",
    `Me chamo ${dados.nome} e preciso de uma corrida:`,
    "*Origem:*",
    dados.enderecoOrigem,
    `https://maps.google.com/?q=${dados.origem.latitude},${dados.origem.longitude}`,
    "*Destino:*",
    dados.enderecoDestino,
    `https://maps.google.com/?q=${dados.destino.latitude},${dados.destino.longitude}`,
    `O valor estimado da minha viagem foi de R$ ${valorFormatado}`,
  ].join("\n");

  const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_MOTORISTA}&text=${encodeURIComponent(
    mensagem
  )}`;

  return Linking.openURL(url);
}

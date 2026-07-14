export type FormaPagamento = "dinheiro" | "cartao" | "pix";

export type ChatMessage = {
  rideId: string;
  texto: string;
  remetente: "motorista" | "passageiro";
  nomeRemetente: string;
  enviadaEm: string;
};

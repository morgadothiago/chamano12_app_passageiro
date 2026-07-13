export type ViaCepSuccessResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: false;
};

export type ViaCepErrorResponse = {
  erro: true;
};

export type ViaCepResponse = ViaCepSuccessResponse | ViaCepErrorResponse;

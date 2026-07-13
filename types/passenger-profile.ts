export type PassengerAddress = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  uf: string;
};

export type PassengerProfile = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  avatarUrl: string | null;
  endereco: PassengerAddress | null;
  cadastroCompleto: boolean;
};

export type UpdateAddressData = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
};

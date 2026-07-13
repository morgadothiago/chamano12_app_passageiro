export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  phone: string | null;
};

export type AuthSession = {
  user: AuthUser;
  token: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignUpData = {
  nome: string;
  email: string;
  phone: string;
  password: string;
};

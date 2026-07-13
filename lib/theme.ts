export const colors = {
  primary: "#1DBF73",
  primaryDark: "#149359",
  background: "#FFFFFF",
  surface: "#FFFFFF",
  overlay: "rgba(15, 23, 42, 0.45)",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  danger: "#DC2626",
  dangerBackground: "#FEF2F2",

  // Tokens do hero escuro das telas de auth (login/cadastro/esqueci-senha).
  // Refinados para o mood "urbano noturno" (ver AuthHero/BootSplash):
  // navy profundo + glow verde-menta contido atrás do logo.
  surfaceDark: "#0F172A",
  surfaceDarkElevated: "#1E293B",
  // Mint mais vivo que `primaryDark`, usado só sobre fundo escuro (glow do
  // logo, anel do botão voltar) — nunca em texto sobre fundo claro.
  accent: "#34D399",
  white: "#FFFFFF",
  // Verde escurecido a partir de `primaryDark` pra garantir 5.4:1 de
  // contraste em texto normal sobre branco (primaryDark puro fica em 3.9:1,
  // abaixo do mínimo AA de 4.5:1 — como não posso mudar o token existente,
  // este novo tom cobre os casos de texto/ícone de sucesso).
  success: "#0F7A45",
  // Espelha o par danger/dangerBackground já existente no app, só que pro
  // caso de sucesso (usado nos boxes de confirmação das telas de auth).
  successBackground: "#ECFDF5",
  textOnDark: "#FFFFFF",
  // Ajustado de #94A3B8 pra #A8B3C4: sobe de 6.96:1 pra 8.42:1 de contraste
  // sobre `surfaceDark`, dando mais folga de leitura pro subtítulo do hero.
  textOnDarkMuted: "#A8B3C4",
  primaryTranslucent: "rgba(52, 211, 153, 0.16)",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  // Adicionado (não substitui nenhum valor existente) pro respiro generoso
  // do hero/sheet das telas de auth.
  xxl: 32,
} as const;

export const shadow = {
  card: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
} as const;

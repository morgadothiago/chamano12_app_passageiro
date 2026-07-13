import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup.string().trim().email("E-mail inválido.").required("Informe seu e-mail."),
  password: yup
    .string()
    .min(6, "A senha deve ter ao menos 6 caracteres.")
    .required("Informe sua senha."),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;

export const signUpSchema = yup.object({
  nome: yup
    .string()
    .trim()
    .min(3, "Informe seu nome completo.")
    .required("Informe seu nome."),
  email: yup.string().trim().email("E-mail inválido.").required("Informe seu e-mail."),
  phone: yup
    .string()
    .trim()
    .transform((value: string) => value.replace(/\D/g, ""))
    .matches(/^\d{10,11}$/, "Telefone inválido — informe DDD + número.")
    .required("Informe seu telefone."),
  password: yup
    .string()
    .min(6, "A senha deve ter ao menos 6 caracteres.")
    .required("Crie uma senha."),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não coincidem.")
    .required("Confirme sua senha."),
});

export type SignUpFormData = yup.InferType<typeof signUpSchema>;

export const forgotPasswordSchema = yup.object({
  email: yup.string().trim().email("E-mail inválido.").required("Informe seu e-mail."),
});

export type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

export const resetPasswordSchema = yup.object({
  code: yup
    .string()
    .trim()
    .matches(/^\d{6}$/, "O código tem 6 dígitos.")
    .required("Informe o código recebido."),
  newPassword: yup
    .string()
    .min(6, "A senha deve ter ao menos 6 caracteres.")
    .required("Crie uma nova senha."),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "As senhas não coincidem.")
    .required("Confirme a nova senha."),
});

export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

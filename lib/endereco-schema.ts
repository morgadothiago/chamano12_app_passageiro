import * as yup from "yup";

export const enderecoSchema = yup.object({
  cep: yup
    .string()
    .transform((v: string) => v.replace(/\D/g, ""))
    .length(8, "CEP deve ter 8 dígitos.")
    .required("Informe o CEP."),
  logradouro: yup.string().trim().required("Informe o logradouro."),
  numero: yup.string().trim().required("Informe o número."),
  complemento: yup.string().trim().optional().default(""),
  bairro: yup.string().trim().required("Informe o bairro."),
  cidade: yup.string().trim().required("Informe a cidade."),
  uf: yup.string().trim().length(2, "UF inválida.").required("Informe a UF."),
});

export type EnderecoFormData = yup.InferType<typeof enderecoSchema>;

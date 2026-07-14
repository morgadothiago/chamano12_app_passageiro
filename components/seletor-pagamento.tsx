import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { FormaPagamento } from "@/types/ride";
import { colors, radius, spacing } from "@/lib/theme";

type Opcao = {
  valor: FormaPagamento;
  rotulo: string;
  icone: keyof typeof Ionicons.glyphMap;
};

// "cartao" continua um valor válido de `FormaPagamento` (corridas antigas
// pagas no cartão ainda existem), só não é mais oferecido como opção nova —
// pagamento simplificado pra dinheiro/Pix por pedido do cliente.
const OPCOES: Opcao[] = [
  { valor: "dinheiro", rotulo: "Dinheiro", icone: "cash-outline" },
  { valor: "pix", rotulo: "Pix", icone: "qr-code-outline" },
];

type SeletorPagamentoProps = {
  selecionado: FormaPagamento;
  onSelecionar: (forma: FormaPagamento) => void;
};

export const SeletorPagamento = memo(function SeletorPagamento({
  selecionado,
  onSelecionar,
}: SeletorPagamentoProps) {
  return (
    <View style={styles.linha}>
      {OPCOES.map((opcao) => {
        const ativo = opcao.valor === selecionado;
        return (
          <TouchableOpacity
            key={opcao.valor}
            activeOpacity={0.8}
            style={[styles.chip, ativo && styles.chipAtivo]}
            onPress={() => onSelecionar(opcao.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: ativo }}
            accessibilityLabel={`Pagar com ${opcao.rotulo}`}
          >
            <Ionicons
              name={opcao.icone}
              size={16}
              color={ativo ? colors.white : colors.textSecondary}
            />
            <Text style={[styles.texto, ativo && styles.textoAtivo]}>{opcao.rotulo}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  linha: { flexDirection: "row", gap: spacing.sm },
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  texto: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  textoAtivo: { color: colors.white },
});

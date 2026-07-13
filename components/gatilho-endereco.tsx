import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { colors, radius, shadow, spacing } from "@/lib/theme";

type GatilhoEnderecoProps = {
  enderecoDestino: string;
  top: number;
  desabilitado: boolean;
  onPress: () => void;
};

export const GatilhoEndereco = memo(function GatilhoEndereco({
  enderecoDestino,
  top,
  desabilitado,
  onPress,
}: GatilhoEnderecoProps) {
  return (
    <View
      style={[styles.inputGatilho, { top } as ViewStyle]}
      pointerEvents={desabilitado ? "none" : "auto"}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.conteudo}
        accessibilityRole="button"
        accessibilityLabel="Definir endereço de destino"
      >
        <View style={styles.iconeBadge}>
          <Ionicons name="search" size={16} color={colors.primary} />
        </View>
        <Text
          style={[styles.texto, enderecoDestino && styles.textoPreenchido]}
          numberOfLines={1}
        >
          {enderecoDestino ? `Para: ${enderecoDestino}` : "Para onde vamos?"}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  inputGatilho: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow.card,
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  conteudo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  iconeBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primaryTranslucent,
    alignItems: "center",
    justifyContent: "center",
  },
  texto: { color: colors.textSecondary, fontSize: 15, flexShrink: 1, flexGrow: 1 },
  textoPreenchido: { color: colors.textPrimary, fontWeight: "600" },
});

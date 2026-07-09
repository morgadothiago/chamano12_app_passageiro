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
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <Text
          style={[styles.texto, enderecoDestino && styles.textoPreenchido]}
          numberOfLines={1}
        >
          {enderecoDestino ? `Para: ${enderecoDestino}` : "Para onde vamos?"}
        </Text>
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
  },
  conteudo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
  },
  texto: { color: colors.textSecondary, fontSize: 15, flexShrink: 1 },
  textoPreenchido: { color: colors.textPrimary, fontWeight: "500" },
});

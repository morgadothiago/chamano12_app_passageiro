import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow, spacing } from "@/lib/theme";

// Placeholder de espaço de anúncio — sem SDK de ads real integrado ainda.
// Só aparece na tela ociosa (sem estimativa/corrida em andamento) pra não
// disputar espaço com o CardEstimativa.
export const AnuncioBanner = memo(function AnuncioBanner() {
  return (
    <View style={styles.container}>
      <Ionicons name="megaphone-outline" size={18} color={colors.textSecondary} />
      <Text style={styles.texto}>Espaço publicitário</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  texto: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
});

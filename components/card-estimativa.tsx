import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Estimativa } from "@/hooks/use-estimativa-corrida";
import { colors, radius, shadow, spacing } from "@/lib/theme";

type CardEstimativaProps = {
  estimativa: Estimativa;
  desabilitado: boolean;
  onChamarMotorista: () => void;
};

export const CardEstimativa = memo(function CardEstimativa({
  estimativa,
  desabilitado,
  onChamarMotorista,
}: CardEstimativaProps) {
  return (
    <SafeAreaView
      edges={["bottom"]}
      style={styles.cardEstimativa}
      pointerEvents={desabilitado ? "none" : "auto"}
    >
      <Text style={styles.valor}>
        R$ {estimativa.valorEstimado.toFixed(2).replace(".", ",")}
      </Text>

      <View style={styles.linhaInfo}>
        <View style={styles.info}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoTexto}>{Math.round(estimativa.duracaoMinutos)} min</Text>
        </View>
        <View style={styles.divisor} />
        <View style={styles.info}>
          <Ionicons name="navigate-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoTexto}>{estimativa.distanciaKm.toFixed(1)} km</Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.85} style={styles.botao} onPress={onChamarMotorista}>
        <Ionicons name="logo-whatsapp" size={20} color="#ffffff" />
        <Text style={styles.botaoTexto}>Chamar motorista</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  cardEstimativa: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...shadow.card,
  },
  valor: { fontWeight: "700", fontSize: 22, color: colors.textPrimary },
  linhaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  info: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoTexto: { color: colors.textSecondary, fontSize: 14 },
  divisor: { width: 1, height: 14, backgroundColor: colors.border },
  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  botaoTexto: { color: "#ffffff", fontWeight: "600", fontSize: 15 },
});

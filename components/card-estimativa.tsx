import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Estimativa } from "@/hooks/use-estimativa-corrida";
import type { RideState } from "@/hooks/use-websocket-corrida";
import { colors, radius, shadow, spacing } from "@/lib/theme";

type CardEstimativaProps = {
  estimativa: Estimativa;
  desabilitado: boolean;
  ride: RideState;
  onChamarMotorista: () => void;
  onCancelar: () => void;
};

export const CardEstimativa = memo(function CardEstimativa({
  estimativa,
  desabilitado,
  ride,
  onChamarMotorista,
  onCancelar,
}: CardEstimativaProps) {
  if (ride.status === "searching") {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.cardEstimativa}>
        <View style={styles.buscandoContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.buscandoTexto}>Buscando motorista...</Text>
          <Text style={styles.buscandoSubtexto}>Aguarde enquanto encontramos um motorista próximo</Text>
          <TouchableOpacity activeOpacity={0.85} style={styles.botaoCancelar} onPress={onCancelar}>
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (ride.status === "accepted" || ride.status === "started") {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.cardEstimativa}>
        <View style={styles.motoristaContainer}>
          <View style={styles.motoristaHeader}>
            <View style={styles.motoristaAvatar}>
              <Ionicons name="car" size={20} color="#ffffff" />
            </View>
            <View style={styles.motoristaInfo}>
              <Text style={styles.motoristaNome}>{ride.driverName}</Text>
              <Text style={styles.motoristaVeiculo}>{ride.vehicle}</Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusTexto}>
              {ride.status === "accepted" ? "A caminho..." : "Em viagem"}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (ride.status === "no_drivers" || ride.status === "timed_out") {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.cardEstimativa}>
        <View style={styles.erroContainer}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.error} />
          <Text style={styles.erroTexto}>
            {ride.status === "no_drivers"
              ? "Nenhum motorista disponível no momento"
              : "Tempo limite excedido. Tente novamente."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Ionicons name="car" size={20} color="#ffffff" />
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
  linhaInfo: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
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
  buscandoContainer: { alignItems: "center", gap: spacing.xs, paddingVertical: spacing.sm },
  buscandoTexto: { fontWeight: "700", fontSize: 16, color: colors.textPrimary, marginTop: spacing.xs },
  buscandoSubtexto: { fontSize: 13, color: colors.textSecondary, textAlign: "center" },
  botaoCancelar: {
    marginTop: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  textoCancelar: { color: colors.error, fontWeight: "600" },
  motoristaContainer: { gap: spacing.sm },
  motoristaHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  motoristaAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  motoristaInfo: { flex: 1 },
  motoristaNome: { fontWeight: "700", fontSize: 16, color: colors.textPrimary },
  motoristaVeiculo: { fontSize: 13, color: colors.textSecondary },
  statusBadge: {
    backgroundColor: "#EAFBF3",
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  statusTexto: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  erroContainer: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  erroTexto: { fontSize: 14, color: colors.textSecondary, textAlign: "center" },
});

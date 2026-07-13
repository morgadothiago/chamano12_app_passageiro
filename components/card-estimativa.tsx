import { Ionicons } from "@expo/vector-icons";
import { memo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Estimativa } from "@/hooks/use-estimativa-corrida";
import type { RideState } from "@/hooks/use-websocket-corrida";
import { colors, radius, shadow, spacing } from "@/lib/theme";

type CardEstimativaProps = {
  estimativa: Estimativa;
  desabilitado: boolean;
  ride: RideState;
  enderecoOrigem: string;
  enderecoDestino: string;
  onChamarMotorista: () => void;
  onCancelar: () => void;
};

export const CardEstimativa = memo(function CardEstimativa({
  estimativa,
  desabilitado,
  ride,
  enderecoOrigem,
  enderecoDestino,
  onChamarMotorista,
  onCancelar,
}: CardEstimativaProps) {
  const [expandido, setExpandido] = useState(false);

  const confirmarCancelamento = () => {
    Alert.alert("Cancelar corrida", "Tem certeza que quer cancelar?", [
      { text: "Não", style: "cancel" },
      { text: "Sim, cancelar", style: "destructive", onPress: onCancelar },
    ]);
  };

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
    const emViagem = ride.status === "started";
    return (
      <SafeAreaView edges={["bottom"]} style={styles.cardEstimativa}>
        <View style={styles.motoristaContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.motoristaHeaderRow}
            onPress={() => setExpandido((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={expandido ? "Ver menos detalhes da corrida" : "Ver mais detalhes da corrida"}
          >
            <View style={{ flex: 1 }}>
              <View
                style={[styles.statusBadge, emViagem ? styles.statusBadgeViagem : styles.statusBadgeCaminho]}
              >
                <View style={[styles.statusPonto, emViagem ? styles.statusPontoViagem : styles.statusPontoCaminho]} />
                <Text
                  style={[styles.statusTexto, emViagem ? styles.statusTextoViagem : styles.statusTextoCaminho]}
                >
                  {emViagem ? "Em viagem" : "Motorista a caminho"}
                </Text>
              </View>

              <View style={styles.motoristaHeader}>
                <View style={styles.motoristaAvatar}>
                  <Ionicons name="car" size={22} color={colors.white} />
                </View>
                <View style={styles.motoristaInfo}>
                  <Text style={styles.motoristaNome}>{ride.driverName}</Text>
                  <Text style={styles.motoristaVeiculo}>{ride.vehicle}</Text>
                </View>
              </View>
            </View>
            <Ionicons
              name={expandido ? "chevron-down" : "chevron-up"}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {expandido && (
            <View style={styles.detalhesContainer}>
              <View style={styles.enderecoLinha}>
                <View style={styles.enderecoIndicadores}>
                  <View style={styles.pontoOrigemPequeno} />
                  <View style={styles.linhaConectoraPequena} />
                  <Ionicons name="square" size={8} color={colors.textPrimary} />
                </View>
                <View style={styles.enderecoTextos}>
                  <Text style={styles.enderecoTexto} numberOfLines={2}>
                    {enderecoOrigem || "Origem"}
                  </Text>
                  <Text style={[styles.enderecoTexto, { marginTop: spacing.md }]} numberOfLines={2}>
                    {enderecoDestino || "Destino"}
                  </Text>
                </View>
              </View>

              <View style={styles.detalhesInfoLinha}>
                <View style={styles.info}>
                  <Ionicons name="navigate-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.infoTexto}>{estimativa.distanciaKm.toFixed(1)} km até o destino</Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.85} style={styles.botaoCancelarCorrida} onPress={confirmarCancelamento}>
                <Text style={styles.textoCancelarCorrida}>Cancelar corrida</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (ride.status === "no_drivers" || ride.status === "timed_out") {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.cardEstimativa}>
        <View style={styles.erroContainer}>
          <View style={styles.erroIconeBadge}>
            <Ionicons name="alert-circle-outline" size={26} color={colors.danger} />
          </View>
          <Text style={styles.erroTitulo}>
            {ride.status === "no_drivers" ? "Nenhum motorista disponível" : "Tempo esgotado"}
          </Text>
          <Text style={styles.erroTexto}>
            {ride.status === "no_drivers"
              ? "Não encontramos motoristas próximos agora. Tente novamente em instantes."
              : "Não conseguimos confirmar sua corrida a tempo. Tente novamente."}
          </Text>
          <TouchableOpacity activeOpacity={0.85} style={styles.botaoCancelar} onPress={onCancelar}>
            <Text style={styles.textoCancelar}>Voltar</Text>
          </TouchableOpacity>
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
      <Text style={styles.rotulo}>Estimativa da corrida</Text>
      <View style={styles.linhaValor}>
        <Text style={styles.valor}>
          R$ {estimativa.valorEstimado.toFixed(2).replace(".", ",")}
        </Text>

        <View style={styles.linhaInfo}>
          <View style={styles.info}>
            <Ionicons name="time-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.infoTexto}>{Math.round(estimativa.duracaoMinutos)} min</Text>
          </View>
          <View style={styles.divisor} />
          <View style={styles.info}>
            <Ionicons name="navigate-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.infoTexto}>{estimativa.distanciaKm.toFixed(1)} km</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.85} style={styles.botao} onPress={onChamarMotorista}>
        <Ionicons name="car" size={20} color={colors.white} />
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
    borderRadius: radius.xl,
    gap: spacing.sm,
    ...shadow.card,
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  rotulo: { color: colors.textMuted, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
  linhaValor: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  valor: { fontWeight: "800", fontSize: 28, color: colors.textPrimary, letterSpacing: -0.5 },
  linhaInfo: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  info: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoTexto: { color: colors.textSecondary, fontSize: 14, fontWeight: "500" },
  divisor: { width: 1, height: 14, backgroundColor: colors.border },
  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  botaoTexto: { color: colors.white, fontWeight: "700", fontSize: 16 },
  buscandoContainer: { alignItems: "center", gap: spacing.xs, paddingVertical: spacing.md },
  buscandoTexto: { fontWeight: "700", fontSize: 17, color: colors.textPrimary, marginTop: spacing.sm },
  buscandoSubtexto: { fontSize: 13, color: colors.textSecondary, textAlign: "center" },
  botaoCancelar: {
    marginTop: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  textoCancelar: { color: colors.textSecondary, fontWeight: "700" },
  motoristaContainer: { gap: spacing.md },
  motoristaHeaderRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  motoristaHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  motoristaAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  motoristaInfo: { flex: 1 },
  motoristaNome: { fontWeight: "700", fontSize: 17, color: colors.textPrimary },
  motoristaVeiculo: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  statusBadgeCaminho: { backgroundColor: colors.primaryTranslucent },
  statusBadgeViagem: { backgroundColor: colors.successBackground },
  statusPonto: { width: 6, height: 6, borderRadius: 3 },
  statusPontoCaminho: { backgroundColor: colors.primary },
  statusPontoViagem: { backgroundColor: colors.success },
  statusTexto: { fontWeight: "700", fontSize: 12 },
  statusTextoCaminho: { color: colors.primaryDark },
  statusTextoViagem: { color: colors.success },
  erroContainer: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  erroIconeBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.dangerBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  erroTitulo: { fontWeight: "700", fontSize: 16, color: colors.textPrimary, textAlign: "center" },
  erroTexto: { fontSize: 14, color: colors.textSecondary, textAlign: "center" },
  detalhesContainer: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  enderecoLinha: { flexDirection: "row", gap: spacing.sm },
  enderecoIndicadores: {
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 6,
  },
  pontoOrigemPequeno: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  linhaConectoraPequena: {
    flex: 1,
    width: 1,
    minHeight: 20,
    backgroundColor: colors.border,
    marginVertical: 3,
  },
  enderecoTextos: { flex: 1 },
  enderecoTexto: { fontSize: 14, color: colors.textPrimary, fontWeight: "500" },
  detalhesInfoLinha: { flexDirection: "row", alignItems: "center" },
  botaoCancelarCorrida: {
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  textoCancelarCorrida: { color: colors.danger, fontWeight: "700", fontSize: 15 },
});

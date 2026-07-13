import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, shadow, spacing } from "@/lib/theme";

type SeletorEnderecoMapaProps = {
  alvo: "origem" | "destino";
  endereco: string;
  resolvendo: boolean;
  topInset: number;
  bottomInset: number;
  onFechar: () => void;
  onConfirmar: () => void;
};

// Camada de UI do modo "escolher no mapa" (padrão Uber/99): fica por cima do
// `MapaCorrida`, que continua montado atrás e é quem realmente se move —
// este componente só desenha a barra superior (endereço resolvido pelo pino
// central) e o botão de confirmação fixo embaixo. O pino em si vive dentro
// do `MapaCorrida` (`modoSelecaoCentral`), porque precisa ficar sincronizado
// com o `MapView`.
export const SeletorEnderecoMapa = memo(function SeletorEnderecoMapa({
  alvo,
  endereco,
  resolvendo,
  topInset,
  bottomInset,
  onFechar,
  onConfirmar,
}: SeletorEnderecoMapaProps) {
  const rotulo = alvo === "origem" ? "origem" : "destino";

  return (
    <>
      <View style={[styles.barraSuperior, { top: topInset + spacing.sm }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.botaoVoltar}
          onPress={onFechar}
          accessibilityRole="button"
          accessibilityLabel="Cancelar seleção no mapa"
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.cartaoEndereco}>
          <Text style={styles.rotulo}>
            {alvo === "origem" ? "Arraste para ajustar a origem" : "Arraste para ajustar o destino"}
          </Text>
          <View style={styles.linhaEndereco}>
            <Ionicons
              name="location"
              size={16}
              color={alvo === "origem" ? colors.primary : colors.surfaceDark}
            />
            {resolvendo ? (
              <View style={styles.linhaCarregando}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
                <Text style={styles.textoCarregando}>Localizando endereço...</Text>
              </View>
            ) : (
              <Text style={styles.textoEndereco} numberOfLines={2}>
                {endereco || "Mova o mapa para escolher o local"}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={[styles.rodape, { bottom: bottomInset + spacing.lg }]} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.botaoConfirmar, (resolvendo || !endereco) && styles.botaoDesabilitado]}
          onPress={onConfirmar}
          disabled={resolvendo || !endereco}
          accessibilityRole="button"
          accessibilityLabel={`Confirmar ${rotulo} neste local`}
        >
          <Text style={styles.botaoConfirmarTexto}>Confirmar {rotulo} aqui</Text>
        </TouchableOpacity>
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  barraSuperior: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    zIndex: 30,
  },
  botaoVoltar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
    shadowOpacity: 0.2,
  },
  cartaoEndereco: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 4,
    ...shadow.card,
    shadowOpacity: 0.18,
  },
  rotulo: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  linhaEndereco: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 22,
  },
  linhaCarregando: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  textoCarregando: { fontSize: 13, color: colors.textSecondary },
  textoEndereco: { fontSize: 14, color: colors.textPrimary, fontWeight: "600", flexShrink: 1 },
  rodape: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    zIndex: 30,
  },
  botaoConfirmar: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoConfirmarTexto: { color: colors.white, fontWeight: "700", fontSize: 16 },
});

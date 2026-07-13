import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { colors, radius, shadow, spacing } from "@/lib/theme";

type ModalNomePassageiroProps = {
  visivel: boolean;
  nome: string;
  onChangeNome: (texto: string) => void;
  onCancelar: () => void;
  onConfirmar: () => void;
};

export const ModalNomePassageiro = memo(function ModalNomePassageiro({
  visivel,
  nome,
  onChangeNome,
  onCancelar,
  onConfirmar,
}: ModalNomePassageiroProps) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <KeyboardAvoidingView
        style={styles.modalFundo}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalFundoInner}>
            <View style={styles.modalCard}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={22} color={colors.primary} />
              </View>

              <Text style={styles.modalTitulo}>Qual seu nome?</Text>
              <Text style={styles.modalSubtitulo}>
                Usamos para o motorista te identificar
              </Text>

              <TextInput
                value={nome}
                onChangeText={onChangeNome}
                placeholder="Digite seu nome"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoFocus
              />

              <View style={styles.modalBotoes}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.botaoSecundario}
                  onPress={onCancelar}
                >
                  <Text style={styles.textoSecundario}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.botaoPrimario}
                  onPress={onConfirmar}
                >
                  <Text style={styles.textoPrimario}>Enviar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalFundo: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  modalFundoInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.surface,
    width: "100%",
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
    ...shadow.card,
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primaryTranslucent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  modalTitulo: { fontSize: 19, fontWeight: "700", color: colors.textPrimary, letterSpacing: -0.3 },
  modalSubtitulo: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modalBotoes: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  botaoSecundario: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.md,
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  textoSecundario: { color: colors.textSecondary, fontWeight: "700" },
  botaoPrimario: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.md,
    alignItems: "center",
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  textoPrimario: { color: colors.white, fontWeight: "700" },
});

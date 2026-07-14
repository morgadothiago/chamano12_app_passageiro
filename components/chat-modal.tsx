import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, shadow, spacing } from "@/lib/theme";
import type { ChatMessage } from "@/types/ride";

type ChatModalProps = {
  visible: boolean;
  driverName: string;
  messages: ChatMessage[];
  onSend: (texto: string) => void;
  onClose: () => void;
};

export function ChatModal({ visible, driverName, messages, onSend, onClose }: ChatModalProps) {
  const [texto, setTexto] = useState("");

  const enviar = () => {
    if (!texto.trim()) return;
    onSend(texto);
    setTexto("");
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <Pressable
              onPress={onClose}
              style={styles.botaoFechar}
              accessibilityRole="button"
              accessibilityLabel="Fechar chat"
            >
              <Ionicons name="chevron-down" size={26} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitulo}>{driverName}</Text>
            <View style={{ width: 26 }} />
          </View>

          <FlatList
            data={messages}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={styles.lista}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <View
                style={[
                  styles.bolha,
                  item.remetente === "passageiro" ? styles.bolhaPropria : styles.bolhaOutro,
                ]}
              >
                <Text
                  style={[
                    styles.bolhaTexto,
                    item.remetente === "passageiro" && styles.bolhaTextoPropria,
                  ]}
                >
                  {item.texto}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.vazioTexto}>Nenhuma mensagem ainda. Diga oi pro motorista!</Text>
            }
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Escreva uma mensagem..."
              placeholderTextColor={colors.textMuted}
              value={texto}
              onChangeText={setTexto}
              onSubmitEditing={enviar}
              returnKeyType="send"
            />
            <Pressable style={styles.botaoEnviar} onPress={enviar}>
              <Ionicons name="send" size={18} color={colors.white} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    zIndex: 50,
  },
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitulo: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
  botaoFechar: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  lista: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  bolha: {
    maxWidth: "80%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  bolhaPropria: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
  },
  bolhaOutro: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
  },
  bolhaTexto: { fontSize: 15, color: colors.textPrimary },
  bolhaTextoPropria: { color: colors.white },
  vazioTexto: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.textPrimary,
  },
  botaoEnviar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});

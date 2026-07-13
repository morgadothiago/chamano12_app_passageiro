import { yupResolver } from "@hookform/resolvers/yup";
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { AuthHero } from "@/components/auth/AuthHero";
import { ControlledInput } from "@/components/form/ControlledInput";
import { Button } from "@/components/ui/Button";
import { colors, radius, spacing } from "@/lib/theme";
import { loginSchema, LoginFormData } from "@/lib/auth-schemas";
import { useAuth } from "@/hooks/use-auth";

export default function LoginScreen() {
  const { login } = useAuth();
  const { accountCreated } = useLocalSearchParams<{ accountCreated?: string }>();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    try {
      await login(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível entrar.";
      setSubmitError(message);
      Toast.show({ type: "error", text1: "Não foi possível entrar", text2: message });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.root}>
        <AuthHero title="Bem-vindo de volta" subtitle="Acesse sua conta de passageiro" />

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {accountCreated ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.successText}>Conta criada com sucesso! Faça login para continuar.</Text>
              </View>
            ) : null}

            <ControlledInput
              control={control}
              name="email"
              label="E-mail"
              placeholder="voce@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />
            <ControlledInput
              control={control}
              name="password"
              label="Senha"
              placeholder="••••••••"
              secureTextEntry
              leftIcon="lock-closed-outline"
            />

            {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

            <Button label="Entrar" onPress={handleSubmit(onSubmit)} loading={isSubmitting} style={styles.submitButton} />

            <Link href="/(auth)/esqueci-senha" style={styles.secondaryLink}>
              Esqueceu a senha?
            </Link>

            <View style={styles.trustRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} />
              <Text style={styles.trustText}>Seus dados ficam protegidos com criptografia</Text>
            </View>
          </ScrollView>

          <SafeAreaView edges={["bottom"]} style={styles.footerSafeArea}>
            <View style={styles.footerDivider} />
            <Link href="/(auth)/cadastro" style={styles.footerLink}>
              Não tem conta? <Text style={styles.footerLinkHighlight}>Cadastre-se</Text>
            </Link>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
  },
  flex: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: "hidden",
  },
  // `justifyContent: "center"` é a peça-chave que resolve o vazio enorme
  // reportado no print: como o formulário de login é curto (2 campos), em
  // vez de deixá-lo grudado no topo do sheet com uma sobra de espaço em
  // branco até o footer, ele fica centralizado no espaço disponível do
  // ScrollView (`flexGrow: 1`) — lê como um card bem posicionado, não como
  // conteúdo "perdido" no topo de uma área vazia.
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  error: { fontSize: 13, color: colors.danger, marginBottom: spacing.md },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.successBackground,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  successText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  secondaryLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryDark,
    textAlign: "center",
    marginTop: spacing.lg,
    // paddingVertical garante tap target >= 44pt (fontSize 14 + lineHeight
    // ~20 + 12*2 = 44) mesmo com um texto curto de uma linha só.
    paddingVertical: spacing.md,
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.xxl,
  },
  trustText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
  footerSafeArea: {
    backgroundColor: colors.background,
    alignItems: "center",
    paddingTop: spacing.md,
  },
  footerDivider: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  footerLink: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    // paddingVertical (em vez de só paddingBottom) garante tap target
    // >= 44pt no link do footer, que fica bem perto da borda inferior.
    paddingVertical: spacing.md,
  },
  footerLinkHighlight: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
});

import { yupResolver } from "@hookform/resolvers/yup";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { signUpSchema, SignUpFormData } from "@/lib/auth-schemas";
import { useAuth } from "@/hooks/use-auth";

export default function CadastroScreen() {
  const { signUp } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    defaultValues: { nome: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setSubmitError(null);
    try {
      await signUp(data);
      Toast.show({ type: "success", text1: "Conta criada com sucesso!" });
      router.replace({ pathname: "/(auth)/login", params: { accountCreated: "1" } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível criar a conta.";
      setSubmitError(message);
      Toast.show({ type: "error", text1: "Não foi possível criar a conta", text2: message });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.root}>
        <AuthHero
          title="Criar conta"
          subtitle="Crie sua conta para pedir corridas com o Chama nº 12."
          onBackPress={() => router.back()}
        />

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <ControlledInput
              control={control}
              name="nome"
              label="Nome completo"
              placeholder="Seu nome"
              leftIcon="person-outline"
            />
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
              name="phone"
              label="Telefone"
              placeholder="(11) 91234-5678"
              keyboardType="phone-pad"
              leftIcon="call-outline"
            />
            <ControlledInput
              control={control}
              name="password"
              label="Senha"
              placeholder="••••••••"
              secureTextEntry
              leftIcon="lock-closed-outline"
            />
            <ControlledInput
              control={control}
              name="confirmPassword"
              label="Confirmar senha"
              placeholder="••••••••"
              secureTextEntry
              leftIcon="lock-closed-outline"
            />

            {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

            <Button label="Criar conta" onPress={handleSubmit(onSubmit)} loading={isSubmitting} style={styles.submitButton} />

            <View style={styles.trustRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} />
              <Text style={styles.trustText}>Seus dados ficam protegidos com criptografia</Text>
            </View>
          </ScrollView>

          <SafeAreaView edges={["bottom"]} style={styles.footerSafeArea}>
            <View style={styles.footerDivider} />
            <Text style={styles.footerLink} onPress={() => router.replace("/(auth)/login")}>
              Já tem conta? <Text style={styles.footerLinkHighlight}>Entrar</Text>
            </Text>
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
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.xl,
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
    // >= 44pt no link do footer.
    paddingVertical: spacing.md,
  },
  footerLinkHighlight: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
});

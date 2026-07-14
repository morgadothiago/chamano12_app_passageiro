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

import { AuthHero } from "@/components/auth/AuthHero";
import { ControlledInput } from "@/components/form/ControlledInput";
import { Button } from "@/components/ui/Button";
import { colors, radius, spacing } from "@/lib/theme";
import { authService } from "@/lib/auth";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/auth-schemas";

export default function EsqueciSenhaScreen() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setSubmitError(null);
    setSuccessMessage(null);
    try {
      await authService.requestPasswordReset(data.email);
      setSuccessMessage("Se o e-mail existir, enviaremos um código de recuperação.");
      router.push({ pathname: "/(auth)/redefinir-senha", params: { email: data.email } });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível continuar.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.root}>
        <AuthHero
          title="Esqueci minha senha"
          subtitle="Informe seu e-mail para receber instruções de recuperação."
          onBackPress={() => router.back()}
        />

        <SafeAreaView edges={["bottom"]} style={styles.flex}>
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              <ControlledInput
                control={control}
                name="email"
                label="E-mail"
                placeholder="voce@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
              />

              {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

              {successMessage ? (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.successText}>{successMessage}</Text>
                </View>
              ) : null}

              <Button
                label="Enviar instruções"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                style={styles.submitButton}
              />

              <View style={styles.trustRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} />
                <Text style={styles.trustText}>Seus dados ficam protegidos com criptografia</Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
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
});

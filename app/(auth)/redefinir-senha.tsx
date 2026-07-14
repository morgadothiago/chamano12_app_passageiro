import { yupResolver } from "@hookform/resolvers/yup";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { authService } from "@/lib/auth";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/auth-schemas";

export default function RedefinirSenhaScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { code: "", newPassword: "", confirmNewPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setSubmitError(null);
    try {
      await authService.resetPassword(email, data.code, data.newPassword);
      Toast.show({ type: "success", text1: "Senha redefinida com sucesso!" });
      router.replace("/(auth)/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível redefinir a senha.";
      setSubmitError(message);
      Toast.show({ type: "error", text1: "Não foi possível redefinir a senha", text2: message });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.root}>
        <AuthHero
          title="Digite o código"
          subtitle={`Enviamos um código de 6 dígitos para ${email ?? "seu e-mail"}.`}
          onBackPress={() => router.back()}
        />

        <SafeAreaView edges={["bottom"]} style={styles.flex}>
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              <ControlledInput
                control={control}
                name="code"
                label="Código"
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                leftIcon="key-outline"
              />
              <ControlledInput
                control={control}
                name="newPassword"
                label="Nova senha"
                placeholder="••••••••"
                secureTextEntry
                leftIcon="lock-closed-outline"
              />
              <ControlledInput
                control={control}
                name="confirmNewPassword"
                label="Confirmar nova senha"
                placeholder="••••••••"
                secureTextEntry
                leftIcon="lock-closed-outline"
              />

              {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

              <Button
                label="Redefinir senha"
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

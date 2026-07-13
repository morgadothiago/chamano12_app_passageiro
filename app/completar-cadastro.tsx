import { yupResolver } from "@hookform/resolvers/yup";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { AuthHero } from "@/components/auth/AuthHero";
import { ControlledInput } from "@/components/form/ControlledInput";
import { Button } from "@/components/ui/Button";
import { colors, radius, spacing } from "@/lib/theme";
import { enderecoSchema, EnderecoFormData } from "@/lib/endereco-schema";
import { formatCep, onlyDigits } from "@/lib/masks";
import { useCepLookup } from "@/hooks/use-cep-lookup";
import { usePassengerProfile } from "@/hooks/use-passenger-profile";

/**
 * Tela única (não é wizard de 4 steps como o motorista-app — só falta
 * endereço) exibida obrigatoriamente após o login enquanto
 * `cadastroCompleto` for false (ver guard raiz em app/_layout.tsx).
 */
export default function CompletarCadastroScreen() {
  const { submitEndereco } = usePassengerProfile();
  const { isLoading: isCepLoading, error: cepError, lookup } = useCepLookup();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<EnderecoFormData>({
    resolver: yupResolver(enderecoSchema),
    defaultValues: { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" },
  });

  const handleCepChange = async (rawValue: string) => {
    const digits = onlyDigits(rawValue);
    setValue("cep", formatCep(rawValue));
    if (digits.length !== 8) return;

    const address = await lookup(digits);
    if (address) {
      setValue("logradouro", address.logradouro, { shouldValidate: true });
      setValue("bairro", address.bairro, { shouldValidate: true });
      setValue("cidade", address.localidade, { shouldValidate: true });
      setValue("uf", address.uf, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: EnderecoFormData) => {
    setSubmitError(null);
    try {
      await submitEndereco(data);
      Toast.show({ type: "success", text1: "Cadastro concluído!" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível concluir o cadastro.";
      setSubmitError(message);
      Toast.show({ type: "error", text1: "Não foi possível concluir o cadastro", text2: message });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.root}>
        <AuthHero
          title="Falta pouco!"
          subtitle="Complete seu cadastro com seu endereço para começar a pedir corridas."
        />

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <ControlledInput
              control={control}
              name="cep"
              label="CEP"
              placeholder="00000-000"
              keyboardType="numeric"
              maxLength={9}
              onChangeText={handleCepChange}
              leftIcon="location-outline"
            />
            {isCepLoading ? (
              <View style={styles.hintRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.hint}>Buscando endereço...</Text>
              </View>
            ) : null}
            {cepError ? (
              <View style={styles.hintRow}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
                <Text style={styles.error}>{cepError}</Text>
              </View>
            ) : null}

            <ControlledInput control={control} name="logradouro" label="Logradouro" placeholder="Rua/Avenida" leftIcon="home-outline" />
            <ControlledInput control={control} name="numero" label="Número" placeholder="123" keyboardType="numeric" />
            <ControlledInput control={control} name="complemento" label="Complemento (opcional)" placeholder="Apto, bloco..." />
            <ControlledInput control={control} name="bairro" label="Bairro" placeholder="Bairro" />
            <ControlledInput control={control} name="cidade" label="Cidade" placeholder="Cidade" />
            <ControlledInput
              control={control}
              name="uf"
              label="UF"
              placeholder="SP"
              autoCapitalize="characters"
              maxLength={2}
            />

            {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

            <Button
              label="Concluir cadastro"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.submitButton}
            />
          </ScrollView>
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
    padding: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  hint: { fontSize: 13, color: colors.textMuted },
  error: { fontSize: 13, color: colors.danger, marginBottom: spacing.md },
});

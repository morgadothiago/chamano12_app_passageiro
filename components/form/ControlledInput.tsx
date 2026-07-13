import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { colors, radius, spacing } from "@/lib/theme";

type ControlledInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
} & Omit<TextInputProps, "secureTextEntry">;

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  label,
  leftIcon,
  secureTextEntry,
  ...inputProps
}: ControlledInputProps<T>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  // Estado puramente visual (anel de foco) — não interfere na validação:
  // o `onBlur` do react-hook-form continua sendo chamado normalmente,
  // só encadeamos a atualização de estilo em cima dele.
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Text style={styles.label}>{label}</Text>
          <View
            style={[
              styles.inputWrap,
              isFocused && styles.inputWrapFocused,
              error && styles.inputWrapError,
            ]}
          >
            {leftIcon ? (
              <Ionicons
                name={leftIcon}
                size={18}
                color={error ? colors.danger : isFocused ? colors.primary : colors.textMuted}
                style={styles.icon}
              />
            ) : null}
            <TextInput
              value={value ?? ""}
              onChangeText={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                onBlur();
              }}
              placeholderTextColor={colors.textMuted}
              secureTextEntry={secureTextEntry && !isPasswordVisible}
              style={styles.input}
              {...inputProps}
            />
            {secureTextEntry ? (
              <Pressable
                onPress={() => setIsPasswordVisible((v) => !v)}
                hitSlop={14}
                accessibilityRole="button"
                accessibilityLabel={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>
            ) : null}
          </View>
          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={13} color={colors.danger} />
              <Text style={styles.error}>{error.message}</Text>
            </View>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
    backgroundColor: colors.background,
  },
  inputWrapFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputWrapError: {
    borderColor: colors.danger,
  },
  icon: {
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    height: "100%",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
  },
});

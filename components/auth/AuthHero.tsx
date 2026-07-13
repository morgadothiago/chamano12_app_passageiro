import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Fragment } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "@/lib/theme";

type AuthHeroProps = {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
};

/**
 * Hero escuro do topo das telas de auth — logo + título/subtítulo sobre
 * `surfaceDark`, com o sheet claro do formulário encaixando por baixo.
 *
 * Duas correções em cima do placeholder original, a partir do feedback do
 * cliente num print do emulador:
 *
 * 1. O relógio/notch do sistema apareciam "soltos" sobre o fundo escuro
 *    porque a StatusBar global (`app/_layout.tsx`) está fixada em
 *    `style="dark"` (ícones escuros, pensada pra o resto do app, que é
 *    claro). Sobre `surfaceDark` isso é ilegível/mal composto. Como este
 *    hero só existe nas 4 telas de auth, ele assume localmente o controle
 *    da status bar (`style="light"`) enquanto estiver montado — ao navegar
 *    pra fora o expo-router desmonta o componente e a global volta a valer.
 * 2. O logo (`logo_App.png`) é uma marca com labaredas irregulares em PNG
 *    transparente — a `View` com `overflow: hidden` + `borderRadius`
 *    circular do placeholder cortava as pontas da chama. Trocado por um
 *    container maior, sem clip, com `resizeMode: "contain"` e um glow
 *    translúcido atrás (círculo com `primaryTranslucent`) pra dar
 *    profundidade sem "estourar" o fundo.
 */
export function AuthHero({ title, subtitle, onBackPress }: AuthHeroProps) {
  return (
    <Fragment>
      <StatusBar style="light" />
      <SafeAreaView edges={["top"]} style={styles.root}>
        {onBackPress ? (
          <Pressable
            onPress={onBackPress}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Ionicons name="chevron-back" size={22} color={colors.textOnDark} />
          </Pressable>
        ) : null}

        <View style={styles.logoWrap}>
          <View style={styles.logoGlow} />
          <Image
            source={require("../../assets/images/logo_App.png")}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>

        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </SafeAreaView>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    alignSelf: "flex-start",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceDarkElevated,
    marginBottom: spacing.md,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  logoWrap: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  logoGlow: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primaryTranslucent,
  },
  logoImage: {
    width: 88,
    height: 88,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: colors.textOnDark,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textOnDarkMuted,
    textAlign: "center",
    marginTop: spacing.xs,
    maxWidth: 280,
  },
});

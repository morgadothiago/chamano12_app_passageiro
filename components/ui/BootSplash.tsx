import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

import { colors, spacing } from "@/lib/theme";

/**
 * Tela exibida enquanto o guard raiz (`app/_layout.tsx`) checa se já existe
 * sessão salva no AsyncStorage antes de decidir a rota inicial.
 *
 * Mesmo ajuste do `AuthHero`: sem clip circular na logo (as labaredas do
 * PNG ficavam cortadas) e status bar local em `light` porque o fundo é
 * escuro (`surfaceDark`), enquanto o resto do app usa status bar escura.
 */
export function BootSplash() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.logoWrap}>
        <View style={styles.logoGlow} />
        <Image
          source={require("../../assets/images/logo_App.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      <ActivityIndicator size="small" color={colors.accent} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  logoGlow: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.primaryTranslucent,
  },
  logoImage: {
    width: 108,
    height: 108,
  },
  spinner: {
    marginTop: spacing.sm,
  },
});

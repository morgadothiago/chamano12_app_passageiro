import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { BootSplash } from "@/components/ui/BootSplash";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { PassengerProfileProvider } from "@/contexts/PassengerProfileContext";
import { useAuth } from "@/hooks/use-auth";
import { usePassengerProfile } from "@/hooks/use-passenger-profile";

function RootNavigator() {
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const { isRegistrationCompleted, isLoading: isLoadingProfile } = usePassengerProfile();

  if (isLoadingAuth || (isAuthenticated && isLoadingProfile)) {
    return <BootSplash />;
  }

  const needsCompletarCadastro = isAuthenticated && !isRegistrationCompleted;
  const canAccessApp = isAuthenticated && isRegistrationCompleted;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={needsCompletarCadastro}>
        <Stack.Screen name="completar-cadastro" />
      </Stack.Protected>

      <Stack.Protected guard={canAccessApp}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    try {
      const NavigationBar = require("expo-navigation-bar");
      NavigationBar.setVisibilityAsync("hidden").catch(() => {});
    } catch {
      // módulo nativo indisponível no Expo Go; funciona só em dev client/apk
    }
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <PassengerProfileProvider>
              <BottomSheetModalProvider>
                <StatusBar style="dark" />
                <RootNavigator />
                <Toast />
              </BottomSheetModalProvider>
            </PassengerProfileProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

import type { ExpoConfig } from "expo/config";

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? "";

const config: ExpoConfig = {
  name: "passageiro-app",
  slug: "passageiro-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/logo_App.png",
  scheme: "passageiroapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.thiagomorgado.passageiro",
    config: {
      googleMapsApiKey,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "Usamos sua localizacao para calcular a origem da corrida.",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.thiagomorgado.passageiro",
    config: {
      googleMaps: {
        apiKey: googleMapsApiKey,
      },
    },
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/logo_App.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#121212",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;

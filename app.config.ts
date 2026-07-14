import type { ExpoConfig } from "expo/config"

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? ""

const config: ExpoConfig = {
  name: "passageiro-app",
  slug: "chamano12passsageiro-",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/logo_App.png",
  scheme: "passageiroapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.thiagomorgado.passageiro",
    deploymentTarget: "15.1",
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
      backgroundColor: "#101010",
      foregroundImage: "./assets/images/android-icon-foreground.png",
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
      "expo-location",
      {
        locationWhenInUsePermission:
          "Usamos sua localizacao para calcular a origem da corrida.",
      },
    ],
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
    [
      "expo-build-properties",
      {
        ios: {
          buildReactNativeFromSource: true,
          deploymentTarget: "15.1",
        },
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          minSdkVersion: 26,
        },
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "9b5d1919-92d4-4c4c-b6e2-0612e82e3ca0",
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
  experiments: {
    typedRoutes: true,
  },
}

export default config

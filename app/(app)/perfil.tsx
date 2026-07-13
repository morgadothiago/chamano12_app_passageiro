import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, shadow, spacing } from "@/lib/theme";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import { usePassengerProfile } from "@/hooks/use-passenger-profile";

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? "";

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function PerfilScreen() {
  const { profile, isLoading } = usePassengerProfile();
  const { upload, isUploading } = useAvatarUpload();

  const handleTrocarFoto = () => {
    Alert.alert("Trocar foto", "De onde você quer escolher a foto?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Câmera", onPress: () => upload(true) },
      { text: "Galeria", onPress: () => upload(false) },
    ]);
  };

  if (isLoading || !profile) {
    return (
      <SafeAreaView style={styles.loadingRoot} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const enderecoTexto = profile.endereco
    ? `${profile.endereco.logradouro}, ${profile.endereco.numero}${
        profile.endereco.complemento ? ` - ${profile.endereco.complemento}` : ""
      }\n${profile.endereco.bairro}, ${profile.endereco.cidade} - ${profile.endereco.uf}`
    : "Endereço não informado";

  const avatarUri = profile.avatarUrl ? `${API_URL}${profile.avatarUrl}` : null;

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Meu perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={colors.textMuted} />
              </View>
            )}
            {isUploading ? (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="small" color={colors.white} />
              </View>
            ) : (
              <Ionicons
                name="camera"
                size={18}
                color={colors.white}
                style={styles.avatarEditBadge}
                onPress={handleTrocarFoto}
              />
            )}
          </View>
          <Text style={styles.nome}>{profile.nome}</Text>
        </View>

        <View style={styles.card}>
          <InfoRow icon="mail-outline" label="E-mail" value={profile.email} />
          <InfoRow icon="call-outline" label="Telefone" value={profile.telefone ?? "Não informado"} />
          <InfoRow icon="location-outline" label="Endereço" value={enderecoTexto} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingRoot: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.lg,
    alignItems: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 48,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEditBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.background,
    ...shadow.card,
  },
  nome: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryTranslucent,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "500",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { forwardRef, memo } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Animated } from "react-native-maps";
import { mapaEstiloMinimalista } from "@/lib/mapa-estilo";
import type { Coordenada } from "@/lib/routes";
import { colors, radius, shadow } from "@/lib/theme";

type MapaCorridaProps = {
  coordOrigem: Coordenada | null;
  coordDestino: Coordenada | null;
  driverLocation: Coordenada | null;
  rota: Coordenada[];
  bottomOffset?: number;
  onRecentralizar?: () => void;
};

export const MapaCorrida = memo(forwardRef<MapView, MapaCorridaProps>(
  ({ coordOrigem, coordDestino, driverLocation, rota, bottomOffset = 24, onRecentralizar }, ref) => {
    return (
      <View style={styles.flex}>
        <MapView
          ref={ref}
          style={styles.flex}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          customMapStyle={mapaEstiloMinimalista}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
          initialRegion={{
            latitude: -15.7942,
            longitude: -47.8822,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {rota.length > 0 && (
            <Polyline
              coordinates={rota}
              strokeColor="#ffffff"
              strokeWidth={8}
              lineCap="round"
              lineJoin="round"
              zIndex={1}
            />
          )}
          {rota.length > 0 && (
            <Polyline
              coordinates={rota}
              strokeColor={colors.textPrimary}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
              zIndex={2}
            />
          )}

          {coordOrigem && (
            <Marker coordinate={coordOrigem} title="Origem" anchor={{ x: 0.5, y: 0.5 }} zIndex={3}>
              <View style={styles.marcadorOrigemAnel}>
                <View style={styles.marcadorOrigemHalo}>
                  <View style={styles.marcadorOrigem} />
                </View>
              </View>
            </Marker>
          )}
          {coordDestino && (
            <Marker coordinate={coordDestino} title="Destino" anchor={{ x: 0.5, y: 1 }} zIndex={4}>
              <View style={styles.pinContainer}>
                <View style={styles.pinSombra} />
                <View style={styles.pinCorpo}>
                  <View style={styles.pinMiolo} />
                </View>
                <View style={styles.pinPonta} />
              </View>
            </Marker>
          )}

          {driverLocation && (
            <Marker
              coordinate={driverLocation}
              title="Motorista"
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={5}
            >
              <View style={styles.driverMarker}>
                <Ionicons name="car" size={18} color="#ffffff" />
              </View>
            </Marker>
          )}
        </MapView>

        {onRecentralizar && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.botaoRecentralizar, { bottom: bottomOffset }]}
            onPress={onRecentralizar}
            accessibilityRole="button"
            accessibilityLabel="Centralizar mapa na minha localização"
          >
            <Ionicons name="navigate" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
));

MapaCorrida.displayName = "MapaCorrida";

const styles = StyleSheet.create({
  flex: { flex: 1 },
  marcadorOrigemAnel: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(29, 191, 115, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  marcadorOrigemHalo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  marcadorOrigem: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  pinContainer: {
    width: 32,
    height: 40,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  pinCorpo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  pinMiolo: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },
  pinPonta: {
    width: 12,
    height: 12,
    backgroundColor: colors.textPrimary,
    transform: [{ rotate: "45deg" }],
    marginTop: -8,
    zIndex: 1,
  },
  pinSombra: {
    position: "absolute",
    bottom: 0,
    width: 14,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 0,
  },
  driverMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  botaoRecentralizar: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    ...shadow.card,
  },
});

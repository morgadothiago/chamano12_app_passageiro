import { CardEstimativa } from "@/components/card-estimativa";
import { FormularioEnderecos } from "@/components/formulario-enderecos";
import { GatilhoEndereco } from "@/components/gatilho-endereco";
import { MapaCorrida } from "@/components/mapa-corrida";
import { ModalNomePassageiro } from "@/components/modal-nome-passageiro";
import { useEnderecosCorrida } from "@/hooks/use-enderecos-corrida";
import { useEstimativaCorrida } from "@/hooks/use-estimativa-corrida";
import { useMotoristasProximos } from "@/hooks/use-motoristas-proximos";
import { useTarifa } from "@/hooks/use-tarifa";
import { useTecladoAtivo } from "@/hooks/use-teclado-ativo";
import { useWebsocketCorrida } from "@/hooks/use-websocket-corrida";
import { decodificarPolilinha } from "@/lib/polilinha";
import { colors, radius, shadow, spacing } from "@/lib/theme";
import { useAuth } from "@/hooks/use-auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import type MapView from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const LOGOUT_ROW_HEIGHT = 44;
const LOGOUT_ROW_GAP = spacing.sm;
// Zoom "ideal" tipo Uber/99: mais aberto que o valor anterior (0.02), que
// ficava apertado demais — mostra o entorno/bairro sem perder o contexto.
const ZOOM_DELTA = 0.035;

export default function Index() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const mapaRef = useRef<MapView>(null);
  const [buscaVisivel, setBuscaVisivel] = useState(false);
  const tecladoAtivo = useTecladoAtivo();

  const tarifa = useTarifa();
  const { estimativa, carregando, erro, calcular, limpar } = useEstimativaCorrida(tarifa);
  const {
    enderecoOrigem,
    enderecoDestino,
    coordOrigem,
    coordDestino,
    buscandoLocalizacao,
    sugestoesOrigem,
    sugestoesDestino,
    handleChangeEnderecoOrigem,
    handleChangeEnderecoDestino,
    escolherSugestaoOrigem,
    escolherSugestaoDestino,
    usarMinhaLocalizacaoComoOrigem,
    resolverCoordenadas,
  } = useEnderecosCorrida();

  const { state: ride, requestRide, cancelRide, reset: resetRide } = useWebsocketCorrida();
  const motoristasProximos = useMotoristasProximos(coordOrigem);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState("");

  const abrirBottomSheet = useCallback(() => {
    setBuscaVisivel(true);
  }, []);

  const fecharBottomSheet = useCallback(() => {
    setBuscaVisivel(false);
  }, []);

  const abrirModalNome = useCallback(() => {
    setModalVisivel(true);
  }, []);

  const fecharModalNome = useCallback(() => {
    setModalVisivel(false);
  }, []);

  const usarMinhaLocalizacao = useCallback(async () => {
    try {
      const coordenada = await usarMinhaLocalizacaoComoOrigem();
      mapaRef.current?.animateToRegion({
        ...coordenada,
        latitudeDelta: ZOOM_DELTA,
        longitudeDelta: ZOOM_DELTA,
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Não foi possível obter sua localização",
        text2: e instanceof Error ? e.message : undefined,
      });
    }
  }, [usarMinhaLocalizacaoComoOrigem]);

  useEffect(() => {
    usarMinhaLocalizacaoComoOrigem()
      .then((coordenada) => {
        mapaRef.current?.animateToRegion({
          ...coordenada,
          latitudeDelta: ZOOM_DELTA,
          longitudeDelta: ZOOM_DELTA,
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chamarCorrida = useCallback(async () => {
    if (!enderecoOrigem.trim() || !enderecoDestino.trim()) {
      Alert.alert("Oopss", "Informe origem e destino.");
      return;
    }

    Keyboard.dismiss();
    limpar();

    try {
      const { origem, destino } = await resolverCoordenadas();

      await calcular(origem, destino);

      fecharBottomSheet();
      mapaRef.current?.fitToCoordinates([origem, destino], {
        edgePadding: { top: 80, right: 80, bottom: 250, left: 80 },
        animated: true,
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Não foi possível traçar a rota",
        text2: e instanceof Error ? e.message : undefined,
      });
    }
  }, [enderecoOrigem, enderecoDestino, resolverCoordenadas, limpar, calcular, fecharBottomSheet]);

  const confirmarChamada = useCallback(() => {
    if (!nome.trim() || !coordOrigem || !coordDestino || !estimativa) return;

    requestRide({
      passengerName: nome.trim(),
      origem: enderecoOrigem,
      origemLat: coordOrigem.latitude,
      origemLng: coordOrigem.longitude,
      destino: enderecoDestino,
      destinoLat: coordDestino.latitude,
      destinoLng: coordDestino.longitude,
      distanciaKm: estimativa.distanciaKm,
      valor: estimativa.valorEstimado,
    });

    setModalVisivel(false);
    setNome("");
  }, [nome, coordOrigem, coordDestino, estimativa, enderecoOrigem, enderecoDestino, requestRide]);

  const handleEnviarNome = useCallback(() => {
    if (!nome.trim()) {
      Alert.alert("Oopss", "Digite seu nome para continuar.");
      return;
    }
    confirmarChamada();
  }, [nome, confirmarChamada]);

  const rota = useMemo(
    () => (estimativa ? decodificarPolilinha(estimativa.polilinha) : []),
    [estimativa]
  );

  const handleCancelarCorrida = useCallback(() => {
    cancelRide();
    resetRide();
    limpar();
  }, [cancelRide, resetRide, limpar]);

  return (
    <View style={styles.flex}>
      <MapaCorrida
        ref={mapaRef}
        coordOrigem={coordOrigem}
        coordDestino={coordDestino}
        driverLocation={ride.driverLocation}
        motoristasProximos={ride.status === "idle" ? motoristasProximos : []}
        rota={rota}
        bottomOffset={estimativa ? 190 : 24}
        onRecentralizar={usarMinhaLocalizacao}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sair da conta"
        onPress={logout}
        style={({ pressed }) => [
          styles.logoutButton,
          { top: insets.top + 12 },
          pressed && styles.logoutButtonPressed,
        ]}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.textOnDark} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Meu perfil"
        onPress={() => router.push("/perfil")}
        style={({ pressed }) => [
          styles.profileButton,
          { top: insets.top + 12 },
          pressed && styles.logoutButtonPressed,
        ]}
      >
        <Ionicons name="person" size={20} color={colors.textOnDark} />
      </Pressable>

      <GatilhoEndereco
        enderecoDestino={enderecoDestino}
        top={insets.top + 12 + LOGOUT_ROW_HEIGHT + LOGOUT_ROW_GAP}
        desabilitado={tecladoAtivo || ride.status !== "idle"}
        onPress={abrirBottomSheet}
      />

      {(estimativa || ride.status !== "idle") && (
        <CardEstimativa
          estimativa={estimativa!}
          desabilitado={tecladoAtivo}
          ride={ride}
          enderecoOrigem={enderecoOrigem}
          enderecoDestino={enderecoDestino}
          onChamarMotorista={abrirModalNome}
          onCancelar={handleCancelarCorrida}
        />
      )}

      <Modal
        visible={buscaVisivel}
        transparent
        animationType="slide"
        onRequestClose={fecharBottomSheet}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={fecharBottomSheet}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          style={styles.modalSheetWrap}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          pointerEvents="box-none"
        >
          <View style={styles.sheetFundo}>
            <View style={styles.sheetHandle} />
            <FormularioEnderecos
              enderecoOrigem={enderecoOrigem}
              enderecoDestino={enderecoDestino}
              carregando={carregando}
              erro={erro}
              sugestoesOrigem={sugestoesOrigem}
              sugestoesDestino={sugestoesDestino}
              onChangeEnderecoOrigem={handleChangeEnderecoOrigem}
              onChangeEnderecoDestino={handleChangeEnderecoDestino}
              onSelecionarSugestaoOrigem={escolherSugestaoOrigem}
              onSelecionarSugestaoDestino={escolherSugestaoDestino}
              onChamarCorrida={chamarCorrida}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ModalNomePassageiro
        visivel={modalVisivel}
        nome={nome}
        onChangeNome={setNome}
        onCancelar={fecharModalNome}
        onConfirmar={handleEnviarNome}
      />

      {buscandoLocalizacao && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  logoutButton: {
    position: "absolute",
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    ...shadow.card,
    shadowOpacity: 0.22,
  },
  profileButton: {
    position: "absolute",
    right: spacing.md + 44 + spacing.sm,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    ...shadow.card,
    shadowOpacity: 0.22,
  },
  logoutButtonPressed: {
    opacity: 0.85,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  modalSheetWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  sheetFundo: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "70%",
    paddingBottom: spacing.md,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    width: 40,
    height: 4,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
});

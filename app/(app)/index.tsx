import { AnuncioBanner } from "@/components/anuncio-banner";
import { AppErrorBanner } from "@/components/app-error-banner";
import { CardEstimativa } from "@/components/card-estimativa";
import { ChatModal } from "@/components/chat-modal";
import { FormularioEnderecos } from "@/components/formulario-enderecos";
import { GatilhoEndereco } from "@/components/gatilho-endereco";
import { MapaCorrida } from "@/components/mapa-corrida";
import { ModalNomePassageiro } from "@/components/modal-nome-passageiro";
import { SeletorEnderecoMapa } from "@/components/seletor-endereco-mapa";
import { useEnderecosCorrida } from "@/hooks/use-enderecos-corrida";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { useEstimativaCorrida } from "@/hooks/use-estimativa-corrida";
import { useMotoristasProximos } from "@/hooks/use-motoristas-proximos";
import { useTarifa } from "@/hooks/use-tarifa";
import { useTecladoAtivo } from "@/hooks/use-teclado-ativo";
import { useWebsocketCorrida } from "@/hooks/use-websocket-corrida";
import { calcularRota, type Coordenada } from "@/lib/routes";
import { decodificarPolilinha } from "@/lib/polilinha";
import { colors, radius, shadow, spacing } from "@/lib/theme";
import type { FormaPagamento } from "@/types/ride";
import { getErrorMessage, isNetworkError } from "@/utils/error-utils";
import { useAuth } from "@/hooks/use-auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RideStatus } from "@/hooks/use-websocket-corrida";
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
import type { Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const LOGOUT_ROW_HEIGHT = 44;
const LOGOUT_ROW_GAP = spacing.sm;

export default function Index() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const mapaRef = useRef<MapView>(null);
  const [buscaVisivel, setBuscaVisivel] = useState(false);
  const tecladoAtivo = useTecladoAtivo();
  const { showError, showBlockingError, hideError: hideBannerError } = useErrorHandler();

  const [networkBannerVisivel, setNetworkBannerVisivel] = useState(false);
  const [networkBannerMensagem, setNetworkBannerMensagem] = useState("");

  const tarifa = useTarifa();
  const { estimativa, carregando, erro: estimativaErro, calcular, limpar } = useEstimativaCorrida(tarifa);
  const {
    enderecoOrigem,
    enderecoDestino,
    coordOrigem,
    coordDestino,
    buscandoLocalizacao,
    resolvendoEnderecoCentral,
    sugestoesOrigem,
    sugestoesDestino,
    handleChangeEnderecoOrigem,
    handleChangeEnderecoDestino,
    escolherSugestaoOrigem,
    escolherSugestaoDestino,
    usarMinhaLocalizacaoComoOrigem,
    resolverEnderecoPorCoordenadaCentral,
    resolverCoordenadas,
  } = useEnderecosCorrida();

  // Padrão Uber/99: quando != null, mostra o pino fixo central por cima do
  // MapaCorrida (que continua montado atrás) em vez do formulário de texto.
  const [modoMapaAtivo, setModoMapaAtivo] = useState<"origem" | "destino" | null>(null);

  const {
    state: ride,
    chatMessages,
    sendChatMessage,
    requestRide,
    cancelRide,
    reset: resetRide,
    connected: wsConnected,
  } = useWebsocketCorrida();
  const motoristasProximos = useMotoristasProximos(coordOrigem);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("dinheiro");
  const [chatVisivel, setChatVisivel] = useState(false);
  const chatLidasRef = useRef(0);
  const chatNaoLidas = chatMessages.length - chatLidasRef.current;

  const abrirChat = useCallback(() => {
    chatLidasRef.current = chatMessages.length;
    setChatVisivel(true);
  }, [chatMessages.length]);

  useEffect(() => {
    if (chatVisivel) chatLidasRef.current = chatMessages.length;
  }, [chatVisivel, chatMessages.length]);

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

  const abrirSelecaoNoMapa = useCallback((alvo: "origem" | "destino") => {
    // Fecha o formulário de texto pra revelar o MapaCorrida por trás — os
    // dois modos não ficam abertos ao mesmo tempo, mas o texto digitado
    // continua valendo como estado inicial do pino.
    setBuscaVisivel(false);
    setModoMapaAtivo(alvo);
  }, []);

  const fecharSelecaoNoMapa = useCallback(() => {
    setModoMapaAtivo(null);
    setBuscaVisivel(true);
  }, []);

  const confirmarSelecaoNoMapa = useCallback(() => {
    setModoMapaAtivo(null);
    setBuscaVisivel(true);
  }, []);

  const handleRegionChangeCompleteSelecao = useCallback(
    (region: Region) => {
      if (!modoMapaAtivo) return;
      resolverEnderecoPorCoordenadaCentral(
        { latitude: region.latitude, longitude: region.longitude },
        modoMapaAtivo,
      );
    },
    [modoMapaAtivo, resolverEnderecoPorCoordenadaCentral],
  );

  const usarMinhaLocalizacao = useCallback(async () => {
    try {
      const coordenada = await usarMinhaLocalizacaoComoOrigem();
      mapaRef.current?.animateToRegion({
        ...coordenada,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
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
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
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
      const msg = getErrorMessage(e);
      showError("Não foi possível traçar a rota", msg);
    }
  }, [enderecoOrigem, enderecoDestino, resolverCoordenadas, limpar, calcular, fecharBottomSheet, showError]);

  const confirmarChamada = useCallback(() => {
    if (!nome.trim() || !coordOrigem || !coordDestino || !estimativa) return;

    try {
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
        formaPagamento,
      });
    } catch (e) {
      showError("Erro ao solicitar corrida", getErrorMessage(e));
      return;
    }

    setModalVisivel(false);
    setNome("");
  }, [nome, coordOrigem, coordDestino, estimativa, enderecoOrigem, enderecoDestino, formaPagamento, requestRide, showError]);

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

  const [rotaAtiva, setRotaAtiva] = useState<Coordenada[]>([]);
  const [etaTexto, setEtaTexto] = useState<string | null>(null);
  const ultimoStatusRotaRef = useRef<RideStatus | null>(null);

  useEffect(() => {
    if (ultimoStatusRotaRef.current === ride.status) return;
    ultimoStatusRotaRef.current = ride.status;

    if (ride.status === "accepted") {
      if (!ride.driverLocation || !coordOrigem) {
        setRotaAtiva([]);
        setEtaTexto(null);
        return;
      }
      calcularRota(ride.driverLocation, coordOrigem)
        .then((r) => {
          setRotaAtiva(decodificarPolilinha(r.polilinha));
          setEtaTexto(`Motorista chega em ${Math.round(r.duracaoMinutos)} min`);
        })
        .catch(() => {
          setRotaAtiva([]);
          setEtaTexto(null);
        });
    } else if (ride.status === "started") {
      if (!coordOrigem || !coordDestino) {
        setRotaAtiva([]);
        setEtaTexto(null);
        return;
      }
      calcularRota(coordOrigem, coordDestino)
        .then((r) => {
          setRotaAtiva(decodificarPolilinha(r.polilinha));
          setEtaTexto(`Chegada em ${Math.round(r.duracaoMinutos)} min`);
        })
        .catch(() => {
          setRotaAtiva([]);
          setEtaTexto(null);
        });
    } else {
      setRotaAtiva([]);
      setEtaTexto(null);
    }
  }, [ride.status, coordOrigem, coordDestino, ride.driverLocation]);

  const rotaFinal = rotaAtiva.length > 0 ? rotaAtiva : rota;

  useEffect(() => {
    if (estimativaErro && isNetworkError(estimativaErro)) {
      setNetworkBannerMensagem("Problema de conexão ao calcular rota. Verifique sua internet.");
      setNetworkBannerVisivel(true);
    }
  }, [estimativaErro]);

  useEffect(() => {
    if (wsConnected === false && ride.status === "idle") {
      setNetworkBannerMensagem("Sem conexão com o servidor. Algumas funcionalidades podem estar indisponíveis.");
      setNetworkBannerVisivel(true);
    } else if (wsConnected === true) {
      // Sem isso, o banner ficava preso na tela mesmo depois do socket
      // reconectar sozinho (retry automático do socket.io) — o usuário via
      // "sem conexão" mesmo já estando conectado de novo.
      setNetworkBannerVisivel(false);
    }
  }, [wsConnected, ride.status]);

  const handleCancelarCorrida = useCallback(() => {
    cancelRide();
    resetRide();
    limpar();
  }, [cancelRide, resetRide, limpar]);

  const handleFinalizarResumo = useCallback(() => {
    resetRide();
    limpar();
  }, [resetRide, limpar]);

  return (
    <View style={styles.flex}>
      <AppErrorBanner
        visible={networkBannerVisivel}
        message={networkBannerMensagem}
        onDismiss={() => setNetworkBannerVisivel(false)}
      />
      <MapaCorrida
        ref={mapaRef}
        coordOrigem={coordOrigem}
        coordDestino={coordDestino}
        driverLocation={ride.driverLocation}
        motoristasProximos={ride.status === "idle" ? motoristasProximos : []}
        rota={rotaFinal}
        etaTexto={etaTexto}
        bottomOffset={estimativa ? 190 : 24}
        onRecentralizar={usarMinhaLocalizacao}
        modoSelecaoCentral={modoMapaAtivo}
        onRegionChangeComplete={handleRegionChangeCompleteSelecao}
      />

      {!modoMapaAtivo && (
        <>
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

          {!buscaVisivel && (
            <GatilhoEndereco
              enderecoDestino={enderecoDestino}
              top={insets.top + 12 + LOGOUT_ROW_HEIGHT + LOGOUT_ROW_GAP}
              desabilitado={tecladoAtivo || ride.status !== "idle"}
              onPress={abrirBottomSheet}
            />
          )}

          {!estimativa && ride.status === "idle" && <AnuncioBanner />}

          {(estimativa || ride.status !== "idle") && (
            <CardEstimativa
              estimativa={estimativa}
              desabilitado={tecladoAtivo}
              ride={ride}
              enderecoOrigem={enderecoOrigem || ride.origem || ""}
              enderecoDestino={enderecoDestino || ride.destino || ""}
              chatNaoLidas={chatNaoLidas}
              onChamarMotorista={abrirModalNome}
              onCancelar={handleCancelarCorrida}
              onFinalizarResumo={handleFinalizarResumo}
              onAbrirChat={abrirChat}
            />
          )}
        </>
      )}

      {modoMapaAtivo && (
        <SeletorEnderecoMapa
          alvo={modoMapaAtivo}
          endereco={modoMapaAtivo === "origem" ? enderecoOrigem : enderecoDestino}
          resolvendo={resolvendoEnderecoCentral}
          topInset={insets.top}
          bottomInset={insets.bottom}
          onFechar={fecharSelecaoNoMapa}
          onConfirmar={confirmarSelecaoNoMapa}
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
              buscandoLocalizacao={buscandoLocalizacao}
              carregando={carregando}
               erro={estimativaErro}
              sugestoesOrigem={sugestoesOrigem}
              sugestoesDestino={sugestoesDestino}
              formaPagamento={formaPagamento}
              onChangeEnderecoOrigem={handleChangeEnderecoOrigem}
              onChangeEnderecoDestino={handleChangeEnderecoDestino}
              onSelecionarSugestaoOrigem={escolherSugestaoOrigem}
              onSelecionarSugestaoDestino={escolherSugestaoDestino}
              onUsarMinhaLocalizacao={usarMinhaLocalizacao}
              onChamarCorrida={chamarCorrida}
              onAjustarOrigemNoMapa={() => abrirSelecaoNoMapa("origem")}
              onAjustarDestinoNoMapa={() => abrirSelecaoNoMapa("destino")}
              onSelecionarFormaPagamento={setFormaPagamento}
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

      {(ride.status === "accepted" || ride.status === "started") && ride.driverName && (
        <ChatModal
          visible={chatVisivel}
          driverName={ride.driverName}
          messages={chatMessages}
          onSend={sendChatMessage}
          onClose={() => setChatVisivel(false)}
        />
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

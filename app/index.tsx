import { CardEstimativa } from "@/components/card-estimativa";
import { FormularioEnderecos } from "@/components/formulario-enderecos";
import { GatilhoEndereco } from "@/components/gatilho-endereco";
import { MapaCorrida } from "@/components/mapa-corrida";
import { ModalNomePassageiro } from "@/components/modal-nome-passageiro";
import { useEnderecosCorrida } from "@/hooks/use-enderecos-corrida";
import { useEstimativaCorrida } from "@/hooks/use-estimativa-corrida";
import { useTarifa } from "@/hooks/use-tarifa";
import { useTecladoAtivo } from "@/hooks/use-teclado-ativo";
import { useWebsocketCorrida } from "@/hooks/use-websocket-corrida";
import { decodificarPolilinha } from "@/lib/polilinha";
import { colors, radius } from "@/lib/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Keyboard, StyleSheet, View } from "react-native";
import type MapView from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const insets = useSafeAreaInsets();
  const mapaRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["45%"], []);
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

  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState("");

  const abrirBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const fecharBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const abrirModalNome = useCallback(() => {
    setModalVisivel(true);
  }, []);

  const fecharModalNome = useCallback(() => {
    setModalVisivel(false);
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const usarMinhaLocalizacao = useCallback(async () => {
    try {
      const coordenada = await usarMinhaLocalizacaoComoOrigem();
      mapaRef.current?.animateToRegion({
        ...coordenada,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch (e) {
      Alert.alert("Oopss", e instanceof Error ? e.message : "Erro ao obter localização.");
    }
  }, [usarMinhaLocalizacaoComoOrigem]);

  useEffect(() => {
    usarMinhaLocalizacaoComoOrigem()
      .then((coordenada) => {
        mapaRef.current?.animateToRegion({
          ...coordenada,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
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
      Alert.alert("Oopss", e instanceof Error ? e.message : "Erro ao traçar rota.");
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
        rota={rota}
        bottomOffset={estimativa ? 190 : 24}
        onRecentralizar={usarMinhaLocalizacao}
      />

      <GatilhoEndereco
        enderecoDestino={enderecoDestino}
        top={insets.top + 12}
        desabilitado={tecladoAtivo || ride.status !== "idle"}
        onPress={abrirBottomSheet}
      />

      {(estimativa || ride.status !== "idle") && (
        <CardEstimativa
          estimativa={estimativa!}
          desabilitado={tecladoAtivo}
          ride={ride}
          onChamarMotorista={abrirModalNome}
          onCancelar={handleCancelarCorrida}
        />
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enablePanDownToClose
        backgroundStyle={styles.sheetFundo}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetView style={styles.flex}>
          <FormularioEnderecos
            enderecoOrigem={enderecoOrigem}
            enderecoDestino={enderecoDestino}
            buscandoLocalizacao={buscandoLocalizacao}
            carregando={carregando}
            erro={erro}
            sugestoesOrigem={sugestoesOrigem}
            sugestoesDestino={sugestoesDestino}
            onChangeEnderecoOrigem={handleChangeEnderecoOrigem}
            onChangeEnderecoDestino={handleChangeEnderecoDestino}
            onSelecionarSugestaoOrigem={escolherSugestaoOrigem}
            onSelecionarSugestaoDestino={escolherSugestaoDestino}
            onUsarMinhaLocalizacao={usarMinhaLocalizacao}
            onChamarCorrida={chamarCorrida}
          />
        </BottomSheetView>
      </BottomSheet>

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
  sheetFundo: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  sheetHandle: {
    backgroundColor: colors.border,
    width: 40,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
});

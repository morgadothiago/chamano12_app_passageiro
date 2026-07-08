import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useEstimativaCorrida } from "@/hooks/use-estimativa-corrida";
import {
  enderecoReverso,
  geocodificarEndereco,
  obterLocalizacaoAtual,
} from "@/lib/localizacao";
import { decodificarPolilinha } from "@/lib/polilinha";
import type { Coordenada } from "@/lib/routes";
import { abrirWhatsappMotorista } from "@/lib/whatsapp";

function useTecladoAtivo() {
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    const mostrar = Keyboard.addListener("keyboardDidShow", () => setAtivo(true));
    const esconder = Keyboard.addListener("keyboardDidHide", () => setAtivo(false));

    return () => {
      mostrar.remove();
      esconder.remove();
    };
  }, []);

  return ativo;
}

export default function Index() {
  const insets = useSafeAreaInsets();
  const mapaRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["45%"], []);
  const tecladoAtivo = useTecladoAtivo();

  const { estimativa, carregando, erro, calcular, limpar } = useEstimativaCorrida();

  const [enderecoOrigem, setEnderecoOrigem] = useState("");
  const [enderecoDestino, setEnderecoDestino] = useState("");
  const [coordOrigem, setCoordOrigem] = useState<Coordenada | null>(null);
  const [coordDestino, setCoordDestino] = useState<Coordenada | null>(null);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState("");

  const abrirBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const fecharBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
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

  async function usarMinhaLocalizacao() {
    setBuscandoLocalizacao(true);
    try {
      const coordenada = await obterLocalizacaoAtual();
      const endereco = await enderecoReverso(coordenada);
      setCoordOrigem(coordenada);
      setEnderecoOrigem(endereco);
      mapaRef.current?.animateToRegion({
        ...coordenada,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch (e) {
      Alert.alert("Oopss", e instanceof Error ? e.message : "Erro ao obter localização.");
    } finally {
      setBuscandoLocalizacao(false);
    }
  }

  async function chamarCorrida() {
    if (!enderecoOrigem.trim() || !enderecoDestino.trim()) {
      Alert.alert("Oopss", "Informe origem e destino.");
      return;
    }

    Keyboard.dismiss();
    limpar();

    try {
      const origem = coordOrigem ?? (await geocodificarEndereco(enderecoOrigem));
      const destino = await geocodificarEndereco(enderecoDestino);
      setCoordOrigem(origem);
      setCoordDestino(destino);

      await calcular(origem, destino);

      fecharBottomSheet();
      mapaRef.current?.fitToCoordinates([origem, destino], {
        edgePadding: { top: 80, right: 80, bottom: 250, left: 80 },
        animated: true,
      });
    } catch (e) {
      Alert.alert("Oopss", e instanceof Error ? e.message : "Erro ao traçar rota.");
    }
  }

  function confirmarChamada() {
    if (!nome.trim() || !coordOrigem || !coordDestino || !estimativa) return;

    abrirWhatsappMotorista({
      nome: nome.trim(),
      enderecoOrigem,
      origem: coordOrigem,
      enderecoDestino,
      destino: coordDestino,
      valorEstimado: estimativa.valorEstimado,
    });

    setModalVisivel(false);
    setNome("");
  }

  const rota = estimativa ? decodificarPolilinha(estimativa.polilinha) : [];

  return (
    <View style={styles.flex}>
      <MapView
        ref={mapaRef}
        style={styles.flex}
        initialRegion={{
          latitude: -15.7942,
          longitude: -47.8822,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {coordOrigem && <Marker coordinate={coordOrigem} title="Origem" pinColor="green" />}
        {coordDestino && <Marker coordinate={coordDestino} title="Destino" />}
        {rota.length > 0 && (
          <Polyline coordinates={rota} strokeColor="#333333" strokeWidth={3} />
        )}
      </MapView>

      <View
        style={[styles.inputGatilho, { top: insets.top + 10 }]}
        pointerEvents={tecladoAtivo ? "none" : "auto"}
      >
        <TouchableOpacity activeOpacity={0.7} onPress={abrirBottomSheet}>
          <Text style={styles.inputGatilhoTexto} numberOfLines={1}>
            {enderecoDestino ? `Para: ${enderecoDestino}` : "Para onde vamos?"}
          </Text>
        </TouchableOpacity>
      </View>

      {estimativa && (
        <SafeAreaView
          edges={["bottom"]}
          style={styles.cardEstimativa}
          pointerEvents={tecladoAtivo ? "none" : "auto"}
        >
          <Text>Tempo de viagem: {Math.round(estimativa.duracaoMinutos)} minutos</Text>
          <Text>Distância: {estimativa.distanciaKm.toFixed(1)} km</Text>
          <Text style={styles.valor}>
            Valor estimado: R$ {estimativa.valorEstimado.toFixed(2).replace(".", ",")}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.botao}
            onPress={() => setModalVisivel(true)}
          >
            <Text style={styles.botaoTexto}>Chamar motorista</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enablePanDownToClose
      >
        <BottomSheetView style={styles.sheetConteudo}>
          <Text style={styles.sheetTitulo}>Informe sua viagem</Text>

          <View style={styles.linhaInput}>
            <BottomSheetTextInput
              value={enderecoOrigem}
              onChangeText={(texto) => {
                setEnderecoOrigem(texto);
                setCoordOrigem(null);
              }}
              placeholder="CEP ou rua de origem"
              style={[styles.input, styles.inputFlex]}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.botaoLocalizacao}
              onPress={usarMinhaLocalizacao}
              disabled={buscandoLocalizacao}
            >
              {buscandoLocalizacao ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.botaoLocalizacaoTexto}>📍</Text>
              )}
            </TouchableOpacity>
          </View>

          <BottomSheetTextInput
            value={enderecoDestino}
            onChangeText={(texto) => {
              setEnderecoDestino(texto);
              setCoordDestino(null);
            }}
            placeholder="CEP ou rua de destino"
            style={styles.input}
          />

          {erro && <Text style={styles.erro}>{erro}</Text>}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.botaoTracar}
            onPress={chamarCorrida}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.botaoTexto}>Chamar</Text>
            )}
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>

      <Modal visible={modalVisivel} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalFundo}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Qual seu nome?</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Digite seu nome"
              style={styles.input}
              autoFocus
            />
            <View style={styles.modalBotoes}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setModalVisivel(false)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (!nome.trim()) {
                    Alert.alert("Oopss", "Digite seu nome para continuar.");
                    return;
                  }
                  confirmarChamada();
                }}
              >
                <Text style={styles.confirmar}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  inputGatilho: {
    position: "absolute",
    left: 10,
    right: 10,
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  inputGatilhoTexto: { color: "#333333" },
  sheetConteudo: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  sheetTitulo: { fontSize: 16, fontWeight: "bold" },
  linhaInput: {
    flexDirection: "row",
    gap: 8,
  },
  inputFlex: { flex: 1 },
  botaoLocalizacao: {
    backgroundColor: "#333333",
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoLocalizacaoTexto: { fontSize: 18 },
  botaoTracar: {
    backgroundColor: "#333333",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cardEstimativa: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    gap: 4,
  },
  valor: { fontWeight: "bold", fontSize: 16, marginTop: 4 },
  erro: { color: "#c0392b" },
  botao: {
    marginTop: 12,
    backgroundColor: "#25D366",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoTexto: { color: "#ffffff", fontWeight: "bold" },
  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    width: "85%",
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  modalTitulo: { fontSize: 16, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 24,
  },
  confirmar: { color: "#25D366", fontWeight: "bold" },
});

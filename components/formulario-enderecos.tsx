import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SugestaoLugar } from "@/lib/autocomplete";
import { colors, radius, shadow, spacing } from "@/lib/theme";
import type { FormaPagamento } from "@/types/ride";
import { SeletorPagamento } from "./seletor-pagamento";

type FormularioEnderecosProps = {
  enderecoOrigem: string;
  enderecoDestino: string;
  buscandoLocalizacao: boolean;
  carregando: boolean;
  erro: string | null;
  sugestoesOrigem: SugestaoLugar[];
  sugestoesDestino: SugestaoLugar[];
  formaPagamento: FormaPagamento;
  onChangeEnderecoOrigem: (texto: string) => void;
  onChangeEnderecoDestino: (texto: string) => void;
  onSelecionarSugestaoOrigem: (sugestao: SugestaoLugar) => void;
  onSelecionarSugestaoDestino: (sugestao: SugestaoLugar) => void;
  onUsarMinhaLocalizacao: () => void;
  onChamarCorrida: () => void;
  onAjustarOrigemNoMapa: () => void;
  onAjustarDestinoNoMapa: () => void;
  onSelecionarFormaPagamento: (forma: FormaPagamento) => void;
};

function ListaSugestoes({
  sugestoes,
  onSelecionar,
}: {
  sugestoes: SugestaoLugar[];
  onSelecionar: (sugestao: SugestaoLugar) => void;
}) {
  if (!sugestoes || sugestoes.length === 0) return null;

  return (
    <View style={styles.listaSugestoes}>
      {sugestoes.map((sugestao) => (
        <TouchableOpacity
          key={sugestao.placeId}
          activeOpacity={0.7}
          style={styles.itemSugestao}
          onPress={() => onSelecionar(sugestao)}
        >
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.textoSugestao} numberOfLines={2}>
            {sugestao.descricao}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export const FormularioEnderecos = memo(function FormularioEnderecos({
  enderecoOrigem,
  enderecoDestino,
  buscandoLocalizacao,
  carregando,
  erro,
  sugestoesOrigem,
  sugestoesDestino,
  formaPagamento,
  onChangeEnderecoOrigem,
  onChangeEnderecoDestino,
  onSelecionarSugestaoOrigem,
  onSelecionarSugestaoDestino,
  onUsarMinhaLocalizacao,
  onChamarCorrida,
  onAjustarOrigemNoMapa,
  onAjustarDestinoNoMapa,
  onSelecionarFormaPagamento,
}: FormularioEnderecosProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.sheetConteudo, { paddingBottom: spacing.lg + insets.bottom }]}>
      <Text style={styles.sheetTitulo}>Para onde vamos?</Text>

      <View style={styles.camposEndereco}>
        <View style={styles.indicadores}>
          <View style={styles.pontoOrigem} />
          <View style={styles.linhaConectora} />
          <Ionicons name="square" size={10} color={colors.textPrimary} />
        </View>

        <View style={styles.inputs}>
          <View style={styles.campoComSugestoes}>
            <View style={styles.linhaInput}>
              <TextInput
                value={enderecoOrigem}
                onChangeText={onChangeEnderecoOrigem}
                placeholder="Endereço ou CEP de origem"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.inputFlex]}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.botaoLocalizacao}
                onPress={onUsarMinhaLocalizacao}
                disabled={buscandoLocalizacao}
                accessibilityRole="button"
                accessibilityLabel="Usar minha localização atual como origem"
              >
                {buscandoLocalizacao ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Ionicons name="locate" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.botaoLocalizacao}
                onPress={onAjustarOrigemNoMapa}
                accessibilityRole="button"
                accessibilityLabel="Ajustar origem arrastando o mapa"
              >
                <Ionicons name="map-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ListaSugestoes sugestoes={sugestoesOrigem} onSelecionar={onSelecionarSugestaoOrigem} />
          </View>

          <View style={styles.campoComSugestoes}>
            <View style={styles.linhaInput}>
              <TextInput
                value={enderecoDestino}
                onChangeText={onChangeEnderecoDestino}
                placeholder="Endereço ou CEP de destino"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.inputFlex]}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.botaoLocalizacao}
                onPress={onAjustarDestinoNoMapa}
                accessibilityRole="button"
                accessibilityLabel="Ajustar destino arrastando o mapa"
              >
                <Ionicons name="map-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ListaSugestoes sugestoes={sugestoesDestino} onSelecionar={onSelecionarSugestaoDestino} />
          </View>
        </View>
      </View>

      <SeletorPagamento selecionado={formaPagamento} onSelecionar={onSelecionarFormaPagamento} />

      {erro && (
        <View style={styles.erroBox}>
          <Ionicons name="alert-circle" size={16} color={colors.danger} />
          <Text style={styles.erro}>{erro}</Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.botaoTracar, carregando && styles.botaoDesabilitado]}
        onPress={onChamarCorrida}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.botaoTexto}>Confirmar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  sheetConteudo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  sheetTitulo: { fontSize: 19, fontWeight: "700", color: colors.textPrimary, letterSpacing: -0.3 },
  camposEndereco: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  indicadores: {
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 22,
  },
  pontoOrigem: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  linhaConectora: {
    flex: 1,
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  inputs: { flex: 1, gap: spacing.sm },
  campoComSugestoes: { position: "relative", zIndex: 10 },
  linhaInput: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  inputFlex: { flex: 1 },
  botaoLocalizacao: {
    backgroundColor: colors.primaryTranslucent,
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoTracar: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: colors.white, fontWeight: "700", fontSize: 16 },
  erroBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.dangerBackground,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  erro: { color: colors.danger, fontSize: 13, flexShrink: 1 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    height: 44,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  listaSugestoes: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.card,
  },
  itemSugestao: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  textoSugestao: { color: colors.textPrimary, fontSize: 14, flexShrink: 1 },
});

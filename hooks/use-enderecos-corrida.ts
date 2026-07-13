import { useCallback, useEffect, useRef, useState } from "react";
import { buscarCoordenadaDoLugar, buscarSugestoesLugar, type SugestaoLugar } from "@/lib/autocomplete";
import { buscarEnderecoPorCep, isCep, mascararCep } from "@/lib/cep";
import { enderecoReverso, geocodificarEndereco, obterLocalizacaoAtual } from "@/lib/localizacao";
import type { Coordenada } from "@/lib/routes";

const DEBOUNCE_SUGESTOES_MS = 350;
// Espera o mapa "assentar" antes de resolver o endereço do pino central —
// evita disparar uma chamada de geocodificação reversa a cada frame de
// arraste (mesmo padrão de debounce usado nas sugestões de autocomplete).
const DEBOUNCE_PIN_CENTRAL_MS = 400;
const PREFIXO_CEP = "viacep:";

async function resolverCoordenadaDoTexto(
  texto: string,
  atualizarTexto: (texto: string) => void
): Promise<Coordenada> {
  if (!isCep(texto)) {
    return geocodificarEndereco(texto);
  }

  const enderecoResolvido = await buscarEnderecoPorCep(texto);
  atualizarTexto(enderecoResolvido);
  return geocodificarEndereco(enderecoResolvido);
}

function useSugestoesCampo(texto: string, coordSelecionada: Coordenada | null) {
  const [sugestoes, setSugestoes] = useState<SugestaoLugar[]>([]);

  useEffect(() => {
    if (coordSelecionada || texto.trim().length < 3) {
      setSugestoes([]);
      return;
    }

    if (isCep(texto)) {
      buscarEnderecoPorCep(texto)
        .then((endereco) => {
          setSugestoes([{ placeId: `${PREFIXO_CEP}${texto.replace(/\D/g, "")}`, descricao: endereco }]);
        })
        .catch(() => setSugestoes([]));
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      buscarSugestoesLugar(texto, controller.signal)
        .then(setSugestoes)
        .catch((erro) => {
          if (erro?.name !== "AbortError") {
            console.warn("Falha ao buscar sugestões de lugar:", erro);
          }
          setSugestoes([]);
        });
    }, DEBOUNCE_SUGESTOES_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [texto, coordSelecionada]);

  return [sugestoes, setSugestoes] as const;
}

export function useEnderecosCorrida() {
  const [enderecoOrigem, setEnderecoOrigem] = useState("");
  const [enderecoDestino, setEnderecoDestino] = useState("");
  const [coordOrigem, setCoordOrigem] = useState<Coordenada | null>(null);
  const [coordDestino, setCoordDestino] = useState<Coordenada | null>(null);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
  const [resolvendoEnderecoCentral, setResolvendoEnderecoCentral] = useState(false);
  const debouncePinCentralRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sugestoesOrigem, setSugestoesOrigem] = useSugestoesCampo(enderecoOrigem, coordOrigem);
  const [sugestoesDestino, setSugestoesDestino] = useSugestoesCampo(enderecoDestino, coordDestino);

  const handleChangeEnderecoOrigem = useCallback((texto: string) => {
    setEnderecoOrigem(mascararCep(texto));
    setCoordOrigem(null);
  }, []);

  const handleChangeEnderecoDestino = useCallback((texto: string) => {
    setEnderecoDestino(mascararCep(texto));
    setCoordDestino(null);
  }, []);

  const selecionarSugestao = useCallback(async (
    sugestao: SugestaoLugar,
    setEndereco: (v: string) => void,
    setCoord: (v: Coordenada) => void,
    setSugestoes: (v: SugestaoLugar[]) => void,
  ) => {
    setEndereco(sugestao.descricao);
    setSugestoes([]);

    try {
      let coordenada: Coordenada;

      if (sugestao.placeId.startsWith(PREFIXO_CEP)) {
        coordenada = await geocodificarEndereco(sugestao.descricao);
      } else {
        coordenada = await buscarCoordenadaDoLugar(sugestao.placeId);
      }

      setCoord(coordenada);
    } catch {
      setEndereco(sugestao.descricao);
    }
  }, []);

  const escolherSugestaoOrigem = useCallback(
    (sugestao: SugestaoLugar) =>
      selecionarSugestao(sugestao, setEnderecoOrigem, setCoordOrigem, setSugestoesOrigem),
    [selecionarSugestao, setSugestoesOrigem],
  );

  const escolherSugestaoDestino = useCallback(
    (sugestao: SugestaoLugar) =>
      selecionarSugestao(sugestao, setEnderecoDestino, setCoordDestino, setSugestoesDestino),
    [selecionarSugestao, setSugestoesDestino],
  );

  const usarMinhaLocalizacaoComoOrigem = useCallback(async (): Promise<Coordenada> => {
    setBuscandoLocalizacao(true);
    try {
      const coordenada = await obterLocalizacaoAtual();
      const endereco = await enderecoReverso(coordenada);
      setCoordOrigem(coordenada);
      setEnderecoOrigem(endereco);
      setSugestoesOrigem([]);
      return coordenada;
    } finally {
      setBuscandoLocalizacao(false);
    }
  }, [setSugestoesOrigem]);

  // Padrão Uber/99: enquanto o usuário arrasta o mapa com o pino fixo no
  // centro da tela, resolvemos o endereço da coordenada central via reverse
  // geocoding (reaproveitando `enderecoReverso`, a mesma função usada em
  // `usarMinhaLocalizacaoComoOrigem`). Debounce evita chamadas em excesso —
  // o chamador (MapaCorrida) já só invoca isso em `onRegionChangeComplete`,
  // mas o debounce protege contra assentamentos rápidos em sequência.
  const resolverEnderecoPorCoordenadaCentral = useCallback(
    (coordenada: Coordenada, alvo: "origem" | "destino") => {
      if (debouncePinCentralRef.current) clearTimeout(debouncePinCentralRef.current);

      const setEndereco = alvo === "origem" ? setEnderecoOrigem : setEnderecoDestino;
      const setCoord = alvo === "origem" ? setCoordOrigem : setCoordDestino;
      const setSugestoes = alvo === "origem" ? setSugestoesOrigem : setSugestoesDestino;

      setCoord(coordenada);
      setResolvendoEnderecoCentral(true);

      debouncePinCentralRef.current = setTimeout(() => {
        enderecoReverso(coordenada)
          .then((endereco) => {
            setEndereco(endereco);
            setSugestoes([]);
          })
          .catch(() => {
            // Mantém a coordenada mesmo se o reverse geocoding falhar —
            // o usuário ainda pode confirmar pela posição do pino.
          })
          .finally(() => setResolvendoEnderecoCentral(false));
      }, DEBOUNCE_PIN_CENTRAL_MS);
    },
    [setSugestoesOrigem, setSugestoesDestino],
  );

  useEffect(() => {
    return () => {
      if (debouncePinCentralRef.current) clearTimeout(debouncePinCentralRef.current);
    };
  }, []);

  const resolverCoordenadas = useCallback(async () => {
    const origem =
      coordOrigem ?? (await resolverCoordenadaDoTexto(enderecoOrigem, setEnderecoOrigem));
    const destino =
      coordDestino ?? (await resolverCoordenadaDoTexto(enderecoDestino, setEnderecoDestino));
    setCoordOrigem(origem);
    setCoordDestino(destino);
    return { origem, destino };
  }, [coordOrigem, coordDestino, enderecoOrigem, enderecoDestino]);

  return {
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
  };
}

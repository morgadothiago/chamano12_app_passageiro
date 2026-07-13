import { useCallback, useEffect, useState } from "react";
import { buscarCoordenadaDoLugar, buscarSugestoesLugar, type SugestaoLugar } from "@/lib/autocomplete";
import { buscarEnderecoPorCep, isCep, mascararCep } from "@/lib/cep";
import { enderecoReverso, geocodificarEndereco, obterLocalizacaoAtual } from "@/lib/localizacao";
import type { Coordenada } from "@/lib/routes";

const DEBOUNCE_SUGESTOES_MS = 350;
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
    sugestoesOrigem,
    sugestoesDestino,
    handleChangeEnderecoOrigem,
    handleChangeEnderecoDestino,
    escolherSugestaoOrigem,
    escolherSugestaoDestino,
    usarMinhaLocalizacaoComoOrigem,
    resolverCoordenadas,
  };
}

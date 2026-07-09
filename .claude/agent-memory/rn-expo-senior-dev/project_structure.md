---
name: project_structure
description: Estrutura de pastas e convenções adotadas neste app (passageiro_app/mobile) após a refatoração da tela principal
metadata:
  type: project
---

Projeto app_chama_no_12/passageiro_app/mobile usa Expo Router (SDK 54) + TypeScript, sem camadas
excessivas: `app/` só rotas (orquestração), `components/` UI específica da tela em kebab-case
(um componente por arquivo, ex: `mapa-corrida.tsx`, `card-estimativa.tsx`), `hooks/` com
convenção `use-*.ts` (ex: `use-estimativa-corrida.ts`, `use-teclado-ativo.ts`), `lib/` para
funções puras/integração (localizacao, polilinha, routes, tarifa, whatsapp), `constants/` para
config (ex: `constants/tarifa.ts` com chaves de API).

**Why:** app/index.tsx tinha 398 linhas concentrando UI + lógica de negócio (geocodificação,
chamada de rota, WhatsApp). Foi pedido split em componentes coesos sem mudar UX/funcionalidade.

**How to apply:** Ao extrair componentes de telas neste projeto, manter nomes em português
(domínio do app é em pt-BR: "corrida", "endereco", "motorista"), tipar props explicitamente,
manter StyleSheet.create local a cada componente (não há tema/design-system central ainda), e
preferir handlers passados via props (`onChangeX`, `onPressX`) ao invés de lógica dentro do
componente de UI. BottomSheet (ref/snapPoints/backdrop) fica na screen pois depende de refs
compartilhados com o mapa; apenas o conteúdo interno (`FormularioEnderecos`) foi extraído.

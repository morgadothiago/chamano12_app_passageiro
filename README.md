# Chamano12 - App do Passageiro

Aplicativo mobile (React Native / Expo) voltado para o passageiro dentro do ecossistema Chamano12, um servico de mobilidade urbana com dois aplicativos complementares: este, para o passageiro, e outro para o motorista.

## A ideia

A ideia do Chamano12 e oferecer uma alternativa de mobilidade urbana com dois apps que conversam entre si: o passageiro solicita a corrida por aqui, e o motorista recebe, aceita e conduz a viagem no outro aplicativo. Este repositorio contem a parte do passageiro: cadastro/login, solicitacao de corrida e acompanhamento da viagem em andamento.

## Como foi desenvolvido

O app foi construido com React Native usando Expo e file-based routing. A base do projeto usa contextos (contexts/) para gerenciar estado de autenticacao e da corrida, hooks customizados (hooks/) para regras reutilizaveis, e uma camada lib/ para chamadas de API, em espelho com o app do motorista. Parte do desenvolvimento contou com apoio de um assistente de IA (Claude) como par de programacao, usado para acelerar a escrita de codigo, mantendo comigo as decisoes de fluxo e regras de negocio do app.

## Stack

React Native, Expo, TypeScript, file-based routing (Expo Router)

## Status

Em desenvolvimento

## Rodando o projeto

npm install
npx expo start

import { Component, PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type ErrorBoundaryState = {
  error: Error | null;
};

/**
 * Sem isso, um erro de render não tratado em produção desmonta a árvore
 * inteira e vira uma tela branca muda — nada no console, nada visível.
 * Captura o erro e mostra mensagem + stack na tela, pra dar pra diagnosticar
 * sem precisar de logs do dispositivo.
 */
export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <View style={styles.root}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Erro inesperado</Text>
            <Text style={styles.message}>{this.state.error.message}</Text>
            {this.state.error.stack ? (
              <Text style={styles.stack}>{this.state.error.stack}</Text>
            ) : null}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#111214",
  },
  content: {
    padding: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  stack: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "monospace",
  },
});

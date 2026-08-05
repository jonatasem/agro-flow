import axios from "axios";

// função auxiliar que extrai mensagens de erro de forma segura, aceitando o erro como 'unknown'.
export const getErrorMessage = (err: unknown, defaultMessage: string): string => {
  // Verifica se o erro foi gerado especificamente pelo Axios (como uma falha na requisição HTTP).
  if (axios.isAxiosError(err)) {
    // Tenta capturar a mensagem customizada enviada pelo servidor ou usa a mensagem padrão caso não exista.
    return err.response?.data?.error || defaultMessage;
  }
  
  // Se não for um erro do Axios, verifica se é uma instância padrão da classe Error do JavaScript/TypeScript.
  return err instanceof Error ? err.message : defaultMessage;
};

import axios from "axios";

// Extrai a mensagem de erro de forma amigável para exibir na tela
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  // Trata erros vindos de requisições HTTP (Axios)
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || defaultMessage;
  }

  // Trata erros padrões do JavaScript (ex: throw new Error)
  if (error instanceof Error) {
    return error.message;
  }

  // Retorno de segurança caso o erro seja de um tipo inesperado
  return defaultMessage;
}
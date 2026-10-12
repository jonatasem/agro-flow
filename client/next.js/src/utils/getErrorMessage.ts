import axios from "axios";

// Extrai e formata a mensagem de erro de forma amigável para exibir na tela ao utilizador.
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  // Trata erros provenientes de requisições HTTP geradas pelo Axios
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || defaultMessage;
  }

  // Trata erros padrão do JavaScript (ex: throw new Error("..."))
  if (error instanceof Error) {
    return error.message;
  }

  // Retorno de segurança caso o erro seja de um tipo desconhecido
  return defaultMessage;
}
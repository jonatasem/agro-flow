import axios from "axios";

const apiUrlServer = process.env.NEXT_PUBLIC_API_URL;

if(!apiUrlServer){
  throw new Error("Falha ao carregar variavel de ambiente do backend, verifique seu .env");
}

// Criação da instância base do Axios apontando para a variável de ambiente do Next.js
export const api = axios.create({
  baseURL: apiUrlServer
});

// Interceptor de requisição: adiciona o token Bearer no cabeçalho se existir no armazenamento local
api.interceptors.request.use((config) => {
  // Verifica se esta no client-side antes de prosseguir
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("@agroflow:token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Interceptor de resposta: trata sessões expiradas ou erros de autenticação (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se a API responder com 401 (Não Autorizado), limpa o armazenamento e redireciona para o login
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("@agroflow:token");
      localStorage.removeItem("@agroflow:user");

      // Redireciona apenas se já não estiver na página de login
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
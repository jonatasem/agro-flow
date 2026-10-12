import axios from "axios";

// Instância base do Axios apontando para a URL da API
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor de requisição: envia o token de acesso no cabeçalho em todas as chamadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@agroflow:token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de resposta: trata sessões expiradas ou não autorizadas (erro 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o backend responder 401 (Não Autorizado), limpa o armazenamento do navegador
    if (error.response?.status === 401) {
      localStorage.removeItem("@agroflow:token");
      localStorage.removeItem("@agroflow:user");

      // Redireciona para a tela de login apenas se o usuário já não estiver nela
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
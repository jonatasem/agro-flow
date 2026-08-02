import axios from "axios";

// Cria e exporta uma instância personalizada do Axios com configurações padrão.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Configura um interceptor que altera a requisição automaticamente antes que ela seja enviada ao servidor.
api.interceptors.request.use((config) => {
  // Busca o token de autenticação JWT salvo no localStorage do navegador.
  const token = localStorage.getItem("@agroflow:token");
  
  // Se o token existir no armazenamento local do usuário, entra na condição.
  if (token) {
    // Garante que o objeto de cabeçalhos (headers) está inicializado para evitar erros de tipo undefined.
    config.headers = config.headers || {};
    // Adiciona o token JWT no cabeçalho Authorization usando o formato padrão 'Bearer'.
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Retorna a configuração modificada para que o Axios continue com o envio da requisição.
  return config;
});

// Importa o React e o hook useState para gerenciar o estado global do usuário logado.
import React, { useState } from "react";

// Importa a instância customizada do Axios configurada com a URL base da aplicação.
import { api } from "../services/api";

// Importa o canal do contexto criado e a interface que tipa a estrutura de dados do usuário.
import { AuthContext, type User } from "./AuthContext";

/**
 * Provedor de Autenticação.
 * Envolve a aplicação para fornecer o estado global de login,
 * dados do usuário conectado e métodos de sessão (signIn, signOut).
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // Recupera o token JWT e a string com os dados do usuário salvos no localStorage do navegador.
  const storedToken = localStorage.getItem("@agroflow:token");
  const storedUser = localStorage.getItem("@agroflow:user");

  // Bloco de execução autoexecutável (IIFE) que valida e desserializa de forma segura as credenciais salvas.
  const parsedUser = (() => {
    // Se ambos, token e dados do usuário, existirem no armazenamento local, entra na condição.
    if (storedToken && storedUser) {
      try {
        // Tenta converter a string JSON de volta para um objeto TypeScript do tipo User.
        return JSON.parse(storedUser);
      } catch {
        // Se a string JSON estiver corrompida ou inválida, limpa os dados salvos para evitar quebras.
        localStorage.removeItem("@agroflow:token");
        localStorage.removeItem("@agroflow:user");
        return null;
      }
    }
    // Retorna nulo se não houver credenciais prévias salvas no navegador.
    return null;
  })();

  // Inicializa o estado reativo do usuário passando o resultado do tratamento do localStorage.
  const [user, setUser] = useState<User | null>(parsedUser);
  
  // Estado utilitário de carregamento iniciado como falso por padrão.
  const [loading] = useState(false);

  /**
   * Logout (Sair).
   * Limpa as credenciais salvas no navegador e reseta o estado do usuário para nulo,
   * forçando o redirecionamento imediato para a tela de login.
   */
  const signOut = () => {
    localStorage.removeItem("@agroflow:token");
    localStorage.removeItem("@agroflow:user");
    setUser(null); // Reseta o estado local limpando a sessão global do app.
  };

  /**
   * Verificar Matrícula (Etapa 1).
   * Envia o ID/Matrícula inserido pelo colaborador ao back-end para validar se o usuário existe.
   * Retorna os dados do colaborador (incluindo o nome) associados a essa matrícula.
   */
  const checkRegistration = async (registration: string) => {
    // Faz uma chamada HTTP POST repassando a matrícula digitada.
    const response = await api.post("/login/check-registration", { registration });
    return response.data; // Retorna o corpo da resposta contendo os dados do funcionário.
  };

  /**
   * Login (Etapa 2).
   * Envia a matrícula e a senha informadas para a API para realizar a autenticação final.
   */
  const signIn = async (registration: string, password: string) => {
    // Dispara a requisição HTTP POST para validar as credenciais informadas.
    const response = await api.post("/login", { registration, password });
    
    // Desestrutura os dados retornados de sucesso pela API (token e atributos do usuário).
    const { token, id, name, role, city } = response.data;

    // Agrupa e estrutura os metadados do usuário baseando-se na interface do tipo User.
    const userData: User = { id, name, role, city };

    // Persiste os dados de sessão de forma permanente no armazenamento do navegador (localStorage).
    localStorage.setItem("@agroflow:token", token);
    localStorage.setItem("@agroflow:user", JSON.stringify(userData)); // Converte o objeto do usuário em string JSON.

    // Atualiza o estado global com os novos dados estruturados do usuário, liberando o acesso ao app.
    setUser(userData);
  };

  return (
    // Renderiza o Provider alimentando o objeto value com os dados reativos e métodos de autenticação.
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user, // Converte o objeto ou nulo em um valor booleano rápido (true/false).
        loading,
        checkRegistration,
        signIn,
        signOut,
      }}
    >
      {/* Renderiza todos os componentes filhos encapsulados dentro do ecossistema do provedor. */}
      {children}
    </AuthContext.Provider>
  );
};

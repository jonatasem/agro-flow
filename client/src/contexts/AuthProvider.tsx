import React, { useState } from "react";
import { api } from "../services/api";
import { AuthContext, type User } from "./AuthContext";

/**
 * Provedor de Autenticação.
 * Envolve a aplicação para fornecer o estado global de login,
 * dados do usuário conectado e métodos de sessão (signIn, signOut).
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storedToken = localStorage.getItem("@agroflow:token");
  const storedUser = localStorage.getItem("@agroflow:user");
  const parsedUser = (() => {

    if (storedToken && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("@agroflow:token");
        localStorage.removeItem("@agroflow:user");
        return null;
      }
    }

    return null;
  })();

  const [user, setUser] = useState<User | null>(parsedUser);
  const [loading] = useState(false);

  // Logout
  const signOut = () => {
    localStorage.removeItem("@agroflow:token");
    localStorage.removeItem("@agroflow:user");
    setUser(null); // Reseta o estado local limpando a sessão global do app.
  };

  //Verificar Matrícula (Etapa 1).
  const checkRegistration = async (registration: string) => {
    // Faz uma chamada HTTP POST repassando a matrícula digitada.
    const response = await api.post("/login/check-registration", { registration });
    return response.data; // Retorna o nome
  };

  // Login (Etapa 2)
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

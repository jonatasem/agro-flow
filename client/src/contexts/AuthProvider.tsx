import React, { useState } from "react";

// Contextos e Tipos
import { AuthContext, type User } from "./AuthContext";

// Serviços
import { api } from "../services/api";

// Provedor do contexto de autenticação responsável pelo gerenciamento de sessão e persistência local
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Inicialização assíncrona do estado com verificação do localStorage
  const [user, setUser] = useState<User | null>(() => {
    const storedToken = localStorage.getItem("@agroflow:token");
    const storedUser = localStorage.getItem("@agroflow:user");

    if (storedToken && storedUser) {
      try {
        return JSON.parse(storedUser) as User;
      } catch {
        localStorage.removeItem("@agroflow:token");
        localStorage.removeItem("@agroflow:user");
        return null;
      }
    }
    return null;
  });

  const [loading] = useState(false);

  // Atualiza os dados do usuário autenticado no estado e na chave do localStorage
  const updateUser = (data: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...data };
      localStorage.setItem("@agroflow:user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // Desconecta o usuário e limpa o armazenamento local
  const signOut = () => {
    localStorage.removeItem("@agroflow:token");
    localStorage.removeItem("@agroflow:user");
    setUser(null);
  };

  // Consulta se a matrícula informada existe no sistema
  const checkRegistration = async (registration: string) => {
    const response = await api.post<{ name: string }>(
      "/login/check-registration",
      { registration }
    );
    return response.data;
  };

  // Realiza o login, salva os dados de sessão e o token de acesso
  const signIn = async (registration: string, password: string) => {
    const response = await api.post("/login", { registration, password });
    const { token, id, name, role, city, sector } = response.data;

    const userData: User = { id, name, role, city, sector, registration };

    localStorage.setItem("@agroflow:token", token);
    localStorage.setItem("@agroflow:user", JSON.stringify(userData));

    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        checkRegistration,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
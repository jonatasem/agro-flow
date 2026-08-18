import React, { useState } from "react";
import { api } from "../services/api";
import { AuthContext, type User } from "./AuthContext";

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

  // Função para atualizar os dados do perfil logado
  const updateUser = (data: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...data };
      localStorage.setItem("@agroflow:user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const signOut = () => {
    localStorage.removeItem("@agroflow:token");
    localStorage.removeItem("@agroflow:user");
    setUser(null);
  };

  const checkRegistration = async (registration: string) => {
    const response = await api.post("/login/check-registration", { registration });
    return response.data;
  };

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
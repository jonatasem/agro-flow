import React, { useState } from "react";
import { api } from "../services/api";
import { AuthContext, type User } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lazy state: lê do localStorage apenas no carregamento inicial da aplicação
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
    const response = await api.post<{ name: string }>("/login/check-registration", { registration });
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
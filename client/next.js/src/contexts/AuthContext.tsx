'use client';

import React, { createContext, useState } from "react";
import { api } from "@/services/api";

export interface User {
  id: string;
  name: string;
  role: string;
  city?: string;
  sector?: string;
  registration?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  checkRegistration: (registration: string) => Promise<{ name: string }>;
  signIn: (registration: string, password: string) => Promise<void>;
  signOut: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const AuthContext = createContext({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
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
    window.location.href = "/login";
  };

  // Verifica a matrícula
  const checkRegistration = async (registration: string) => {
    const response = await api.post<{ name: string }>(
      "/login/check-registration",
      { registration }
    );
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

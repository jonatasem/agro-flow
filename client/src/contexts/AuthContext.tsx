"use client";

import React, { createContext, useCallback, useMemo, useState } from "react";
import { authService } from "@/services/authService";
import {
  clearSessionStorage,
  TOKEN_KEY,
  USER_KEY,
} from "@/services/api";

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

export const AuthContext = createContext<AuthContextType | null>(null);

function getInitialUser(): User | null {
  if (typeof window === "undefined") return null;

  const storedToken = localStorage.getItem(TOKEN_KEY);
  const storedUser = localStorage.getItem(USER_KEY);
  if (!storedToken || !storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    clearSessionStorage();
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [loading] = useState(false);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const signOut = useCallback(() => {
    clearSessionStorage();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  }, []);

  const checkRegistration = useCallback(async (registration: string) => {
    return authService.checkRegistration(registration);
  }, []);

  const signIn = useCallback(async (registration: string, password: string) => {
    const data = await authService.login({ registration, password });
    const userData: User = {
      id: data.id,
      name: data.name,
      role: data.role,
      city: data.city,
      sector: data.sector,
      registration,
    };

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      checkRegistration,
      signIn,
      signOut,
      updateUser,
    }),
    [user, loading, checkRegistration, signIn, signOut, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
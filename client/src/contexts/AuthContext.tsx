'use client';

import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import { api } from "@/services/api";

const TOKEN_KEY = "@agroflow:token";
const USER_KEY = "@agroflow:user";

export interface User {
  id: string;
  name: string;
  role: string;
  city?: string;
  sector?: string;
  registration?: string;
}

interface LoginResponse {
  token: string;
  id: string;
  name: string;
  role: string;
  city?: string;
  sector?: string;
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

function clearStorageSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getInitialUser(): User | null {
  if (typeof window === "undefined") return null;

  const storedToken = localStorage.getItem(TOKEN_KEY);
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedToken || !storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    clearStorageSession();
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [loading] = useState(false);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...data };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const signOut = useCallback(() => {
    clearStorageSession();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  }, []);

  const checkRegistration = useCallback(async (registration: string) => {
    const { data } = await api.post<{ name: string }>(
      "/login/check-registration",
      { registration }
    );
    return data;
  }, []);

  const signIn = useCallback(async (registration: string, password: string) => {
    const { data } = await api.post<LoginResponse>("/login", {
      registration,
      password,
    });

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

  const contextValue = useMemo<AuthContextType>(
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

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
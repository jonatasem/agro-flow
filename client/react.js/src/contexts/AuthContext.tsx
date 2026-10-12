import { createContext } from "react";

// Interface que define os dados do usuário autenticado no sistema
export interface User {
  id: string;
  name: string;
  role: string;
  city?: string;
  sector?: string;
  registration?: string;
}

// Interface com o contrato e métodos providos pelo contexto de autenticação
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  checkRegistration: (registration: string) => Promise<{ name: string }>;
  signIn: (registration: string, password: string) => Promise<void>;
  signOut: () => void;
  updateUser: (data: Partial<User>) => void;
}

// Contexto global de autenticação
export const AuthContext = createContext({} as AuthContextType);
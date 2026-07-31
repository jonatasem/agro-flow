import { createContext } from "react";

export interface User {
  id: string;
  name: string;
  role: string;
  city?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  checkRegistration: (registration: string) => Promise<{ name: string }>;
  signIn: (registration: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext({} as AuthContextType);

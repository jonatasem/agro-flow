import { useContext } from "react";

// Contextos e Tipos
import { AuthContext, type AuthContextType } from "../contexts/AuthContext";

// Hook customizado para consumir o contexto de autenticação do usuário
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  }

  return context;
};
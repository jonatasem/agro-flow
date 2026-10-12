import { useContext } from "react";
import { AuthContext, type AuthContextType } from "@/contexts/AuthContext";

// Lança um erro caso seja invocado fora de um componente envolto pelo AuthProvider.
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa de ser usado dentro de um AuthProvider");
  }

  return context;
};
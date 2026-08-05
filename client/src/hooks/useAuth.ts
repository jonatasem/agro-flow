import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../contexts/AuthContext";

// Cria e exporta o hook personalizado useAuth, garantindo que ele retorne os dados no formato AuthContextType.
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  // Verifica se o hook foi chamado fora do componente <AuthProvider>.
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  }
  
  return context;
};

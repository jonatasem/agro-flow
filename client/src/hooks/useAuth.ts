// Importa o hook useContext do React para consumir estados e dados globais.
import { useContext } from "react";

// Importa o contexto criado e a tipagem de dados que este contexto deve conter.
import { AuthContext, type AuthContextType } from "../contexts/AuthContext";

// Cria e exporta o hook personalizado useAuth, garantindo que ele retorne os dados no formato AuthContextType.
export const useAuth = (): AuthContextType => {
  // Consome os dados compartilhados dentro do AuthContext.
  const context = useContext(AuthContext);
  
  // Verifica se o hook foi chamado fora do componente <AuthProvider>.
  if (!context) {
    // Dispara um erro crítico no console para avisar o desenvolvedor sobre o erro de estrutura.
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  }
  
  // Retorna os dados de autenticação (como user, login, logout) para o componente que chamou o hook.
  return context;
};

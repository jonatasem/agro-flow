// Importa a função createContext do React para criar o canal de compartilhamento global de estados.
import { createContext } from "react";

// Define a estrutura de dados que representa o usuário autenticado no sistema AgroFlow.
export interface User {
  id: string;          // Identificador único do usuário no banco de dados.
  name: string;        // Nome completo do colaborador ou operador logado.
  role: string;        // Nível de acesso/cargo (ex: "TECNICO", "ADMIN", "LIDER").
  city?: string;       // Cidade ou base de atuação operacional (opcional).
}

// Define o contrato estrito de tipagem com todos os estados e métodos que o contexto deve fornecer.
export interface AuthContextType {
  user: User | null;         // Guarda os dados do usuário conectado ou 'null' se estiver deslogado.
  isAuthenticated: boolean;  // Flag booleana rápida para checar se o usuário possui sessão ativa.
  loading: boolean;          // Indica se o sistema está validando o token ou restaurando a sessão antiga.
  
  // Função da primeira etapa do login: recebe a matrícula e retorna uma promessa com o nome do colaborador encontrado.
  checkRegistration: (registration: string) => Promise<{ name: string }>;
  
  // Função da segunda etapa do login: envia as credenciais finais para autenticar e gerar o token JWT.
  signIn: (registration: string, password: string) => Promise<void>;
  
  // Função de encerramento de sessão: limpa os dados do estado global e remove o token do armazenamento.
  signOut: () => void;
}

// Cria e exporta o objeto AuthContext, utilizando asserção de tipo (as AuthContextType) 
// para blindar a inicialização vazia contra erros de checagem do TypeScript.
export const AuthContext = createContext({} as AuthContextType);

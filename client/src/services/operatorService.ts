import { api } from "./api";

// Interface com as informações do operador
export interface Operator {
  id: string;
  name: string;
  role?: string;
  registration: string;
  city?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Tipagem dos dados necessários para criar um operador
export type CreateOperatorInput = Omit<Operator, "id" | "createdAt" | "updatedAt"> & {
  password?: string;
};

// Tipagem dos dados permitidos na atualização de um operador
export type UpdateOperatorInput = Partial<CreateOperatorInput>;

// Serviço responsável pelas requisições de operadores
export const operatorService = {
  // Lista todos os operadores cadastrados
  getAll: async (): Promise<Operator[]> => {
    const response = await api.get<Operator[]>("/operator");
    return response.data;
  },

  // Busca as informações de um operador específico pelo ID
  getById: async (id: string): Promise<Operator> => {
    const response = await api.get<Operator>(`/operator/${id}`);
    return response.data;
  },

  // Cadastra um novo operador no sistema
  create: async (payload: CreateOperatorInput): Promise<Operator> => {
    const response = await api.post<Operator>("/operator", payload);
    return response.data;
  },

  // Atualiza os dados de um operador existente
  update: async (id: string, payload: UpdateOperatorInput): Promise<Operator> => {
    const response = await api.put<Operator>(`/operator/${id}`, payload);
    return response.data;
  },

  // Remove um operador pelo ID
  delete: async (id: string): Promise<void> => {
    await api.delete(`/operator/${id}`);
  },
};
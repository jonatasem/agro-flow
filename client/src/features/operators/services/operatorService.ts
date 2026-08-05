import { api } from "../../../services/api";

export interface Operator {
  id: string;            
  name: string;          
  role: string;      
  registration: string;
  city: string;     
  status: boolean;  
  createdAt: string;
  updatedAt?: string;
}

// Cria a tipagem de entrada removendo os campos gerenciados automaticamente pelo banco de dados.
export type CreateOperatorInput = Omit<Operator, "id" | "createdAt" | "updatedAt">;

// Transforma todas as propriedades de criação em opcionais para permitir atualizações parciais.
export type UpdateOperatorInput = Partial<CreateOperatorInput>;

export const OperatorService = {
  
  getAll: async (): Promise<Operator[]> => {
    const response = await api.get<Operator[]>("/operator");
    return response.data;
  },

  getById: async (id: string): Promise<Operator> => {
    const response = await api.get<Operator>(`/operator/${id}`);
    return response.data; // Retorna os detalhes do registro localizado.
  },

  create: async (payload: CreateOperatorInput): Promise<Operator> => {
    const response = await api.post<Operator>("/operator", payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateOperatorInput): Promise<Operator> => {
    const response = await api.put<Operator>(`/operator/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/operator/${id}`);
  },
};

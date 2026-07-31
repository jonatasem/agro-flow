import { api } from "../../../services/api";

export interface Operator {
  id: string;
  name: string;
  role: string;
  registration?: string;
  city?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateOperatorInput = Omit<Operator, "id" | "createdAt" | "updatedAt">;
export type UpdateOperatorInput = Partial<CreateOperatorInput>;

export const OperatorService = {
  // Listar todos os colaboradores
  getAll: async (): Promise<Operator[]> => {
    const response = await api.get<Operator[]>("/operator");
    return response.data;
  },

  // Buscar por ID
  getById: async (id: string): Promise<Operator> => {
    const response = await api.get<Operator>(`/operator/${id}`);
    return response.data;
  },

  // Criar novo colaborador
  create: async (payload: CreateOperatorInput): Promise<Operator> => {
    const response = await api.post<Operator>("/operator", payload);
    return response.data;
  },

  // Atualizar colaborador
  update: async (id: string, payload: UpdateOperatorInput): Promise<Operator> => {
    const response = await api.put<Operator>(`/Operator/${id}`, payload);
    return response.data;
  },

  // Eliminar colaborador
  delete: async (id: string): Promise<void> => {
    await api.delete(`/Operator/${id}`);
  },
};

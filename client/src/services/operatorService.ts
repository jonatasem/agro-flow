import { api } from "./api";

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

export type CreateOperatorInput = Omit<Operator, "id" | "createdAt" | "updatedAt"> & {
  password?: string;
};

export type UpdateOperatorInput = Partial<CreateOperatorInput>;

export const operatorService = {
  getAll: async (): Promise<Operator[]> => {
    const response = await api.get<Operator[]>("/operator");
    return response.data;
  },

  getById: async (id: string): Promise<Operator> => {
    const response = await api.get<Operator>(`/operator/${id}`);
    return response.data;
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
import { api } from "./api";

export interface Equipment {
  id: string;
  fleet: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateEquipmentInput = Omit<Equipment, "id" | "createdAt" | "updatedAt">;
export type UpdateEquipmentInput = Partial<CreateEquipmentInput>;

export const equipmentService = {
  getAll: async (): Promise<Equipment[]> => {
    const response = await api.get<Equipment[]>("/equipment");
    return response.data;
  },

  getById: async (id: string): Promise<Equipment> => {
    const response = await api.get<Equipment>(`/equipment/${id}`);
    return response.data;
  },

  create: async (payload: CreateEquipmentInput): Promise<Equipment> => {
    const response = await api.post<Equipment>("/equipment", payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateEquipmentInput): Promise<Equipment> => {
    const response = await api.put<Equipment>(`/equipment/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/equipment/${id}`);
  },
};
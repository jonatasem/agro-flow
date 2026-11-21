import { api } from "./api";
import type { Equipment } from "@/types/equipment";

export type CreateEquipmentInput = Omit<
  Equipment,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateEquipmentInput = Partial<CreateEquipmentInput>;

export const equipmentService = {
  getAll: async (): Promise<Equipment[]> => {
    const { data } = await api.get<Equipment[]>("/equipment");
    return data;
  },
  create: async (payload: CreateEquipmentInput): Promise<Equipment> => {
    const { data } = await api.post<Equipment>("/equipment", payload);
    return data;
  },
  update: async (
    id: string,
    payload: UpdateEquipmentInput
  ): Promise<Equipment> => {
    const { data } = await api.put<Equipment>(`/equipment/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/equipment/${id}`);
  },
};
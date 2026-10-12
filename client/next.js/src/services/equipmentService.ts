import { api } from "./api";

import type { Equipment } from "@/types/equipment";

// Tipagem dos dados necessários para criar um equipamento
export type CreateEquipmentInput = Omit<Equipment, "id" | "createdAt" | "updatedAt">;

// Tipagem dos dados permitidos na atualização de um equipamento
export type UpdateEquipmentInput = Partial<CreateEquipmentInput>;

// Serviço responsável pelas requisições de equipamentos
export const equipmentService = {
  // Lista todos os equipamentos da frota
  getAll: async (): Promise<Equipment[]> => {
    const response = await api.get<Equipment[]>("/equipment");
    return response.data;
  },

  // Busca um equipamento específico pelo ID
  getById: async (id: string): Promise<Equipment> => {
    const response = await api.get<Equipment>(`/equipment/${id}`);
    return response.data;
  },

  // Regista um novo equipamento na frota
  create: async (payload: CreateEquipmentInput): Promise<Equipment> => {
    const response = await api.post<Equipment>("/equipment", payload);
    return response.data;
  },

  // Atualiza os dados de um equipamento existente
  update: async (id: string, payload: UpdateEquipmentInput): Promise<Equipment> => {
    const response = await api.put<Equipment>(`/equipment/${id}`, payload);
    return response.data;
  },

  // Remove um equipamento pelo ID
  delete: async (id: string): Promise<void> => {
    await api.delete(`/equipment/${id}`);
  },
};
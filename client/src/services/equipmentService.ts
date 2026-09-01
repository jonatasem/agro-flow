import { api } from "./api";

// Interface com as informações do equipamento
export interface Equipment {
  id: string;
  fleet: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// Tipagem dos dados necessários para criar um equipamento
export type CreateEquipmentInput = Omit<Equipment, "id" | "createdAt" | "updatedAt">;

// Tipagem dos dados permitidos na atualização de um equipamento
export type UpdateEquipmentInput = Partial<CreateEquipmentInput>;

// Serviço responsável pelas requisições de equipamentos
export const equipmentService = {
  // Lista todos os equipamentos cadastrados
  getAll: async (): Promise<Equipment[]> => {
    const response = await api.get<Equipment[]>("/equipment");
    return response.data;
  },

  // Busca as informações de um equipamento específico pelo ID
  getById: async (id: string): Promise<Equipment> => {
    const response = await api.get<Equipment>(`/equipment/${id}`);
    return response.data;
  },

  // Cadastra um novo equipamento no sistema
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
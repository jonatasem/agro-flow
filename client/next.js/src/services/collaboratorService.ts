import { api } from "./api";

import type { Collaborator } from "@/types/collaborator";

// Tipagem dos dados necessários para criar um colaborador
export type CreateCollaboratorInput = Omit<Collaborator, "id" | "createdAt" | "updatedAt"> & {
  password: string;
};

// Tipagem dos dados permitidos na atualização de um colaborador
export type UpdateCollaboratorInput = Partial<CreateCollaboratorInput>;

// Serviço responsável pelas requisições de colaboradores
export const collaboratorService = {
  // Lista todos os colaboradores registados
  getAll: async (): Promise<Collaborator[]> => {
    const response = await api.get<Collaborator[]>("/collaborator");
    return response.data;
  },

  // Busca os dados de um colaborador específico pelo ID
  getById: async (id: string): Promise<Collaborator> => {
    const response = await api.get<Collaborator>(`/collaborator/${id}`);
    return response.data;
  },

  // Regista um novo colaborador
  create: async (payload: CreateCollaboratorInput): Promise<Collaborator> => {
    const response = await api.post<Collaborator>("/collaborator", payload);
    return response.data;
  },

  // Atualiza os dados de um colaborador existente
  update: async (id: string, payload: UpdateCollaboratorInput): Promise<Collaborator> => {
    const response = await api.put<Collaborator>(`/collaborator/${id}`, payload);
    return response.data;
  },

  // Remove um colaborador pelo ID
  delete: async (id: string): Promise<void> => {
    await api.delete(`/collaborator/${id}`);
  },
};
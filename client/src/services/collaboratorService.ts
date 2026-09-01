import { api } from "./api";

// Interface principal com as informações do colaborador
export interface Collaborator {
  id: string;
  name: string;
  role: string;
  registration: string;
  city?: string;
  sector?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Tipagem dos dados necessários para criar um colaborador
export type CreateCollaboratorInput = Omit<Collaborator, "id" | "createdAt" | "updatedAt"> & {
  password?: string;
};

// Tipagem dos dados permitidos na atualização de um colaborador
export type UpdateCollaboratorInput = Partial<CreateCollaboratorInput>;

// Serviço responsável pelas requisições de colaboradores
export const collaboratorService = {
  // Lista todos os colaboradores cadastrados
  getAll: async (): Promise<Collaborator[]> => {
    const response = await api.get<Collaborator[]>("/collaborator");
    return response.data;
  },

  // Busca as informações de um colaborador específico pelo ID
  getById: async (id: string): Promise<Collaborator> => {
    const response = await api.get<Collaborator>(`/collaborator/${id}`);
    return response.data;
  },

  // Cadastra um novo colaborador no sistema
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
import { api } from "../../../services/api";

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  registration: string;
  city?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateCollaboratorInput = Omit<Collaborator, "id" | "createdAt" | "updatedAt"> & {
  password?: string;
};

export type UpdateCollaboratorInput = Partial<CreateCollaboratorInput>;

export const collaboratorService = {
  getAll: async (): Promise<Collaborator[]> => {
    const response = await api.get<Collaborator[]>("/collaborator");
    return response.data;
  },

  getById: async (id: string): Promise<Collaborator> => {
    const response = await api.get<Collaborator>(`/collaborator/${id}`);
    return response.data;
  },

  create: async (payload: CreateCollaboratorInput): Promise<Collaborator> => {
    const response = await api.post<Collaborator>("/collaborator", payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateCollaboratorInput): Promise<Collaborator> => {
    const response = await api.put<Collaborator>(`/collaborator/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/collaborator/${id}`);
  },
};

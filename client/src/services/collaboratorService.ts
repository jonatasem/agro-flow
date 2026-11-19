import { api } from "./api";
import type { Collaborator } from "@/types/collaborator";

export type CreateCollaboratorInput = Omit<
  Collaborator,
  "id" | "createdAt" | "updatedAt"
> & {
  password: string;
};

export type UpdateCollaboratorInput = Partial<CreateCollaboratorInput>;

export const collaboratorService = {
  getAll: async (): Promise<Collaborator[]> => {
    const { data } = await api.get<Collaborator[]>("/collaborator");
    return data;
  },

  getById: async (id: string): Promise<Collaborator> => {
    const { data } = await api.get<Collaborator>(`/collaborator/${id}`);
    return data;
  },

  create: async (payload: CreateCollaboratorInput): Promise<Collaborator> => {
    const { data } = await api.post<Collaborator>("/collaborator", payload);
    return data;
  },

  update: async (
    id: string,
    payload: UpdateCollaboratorInput
  ): Promise<Collaborator> => {
    const { data } = await api.put<Collaborator>(`/collaborator/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/collaborator/${id}`);
  },
};
import { api } from "./api";
import type { Operator } from "@/types/operator";

export type CreateOperatorInput = Omit<
  Operator,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateOperatorInput = Partial<CreateOperatorInput>;

export const operatorService = {
  getAll: async (): Promise<Operator[]> => {
    const { data } = await api.get<Operator[]>("/operator");
    return data;
  },
  create: async (payload: CreateOperatorInput): Promise<Operator> => {
    const { data } = await api.post<Operator>("/operator", payload);
    return data;
  },
  update: async (
    id: string,
    payload: UpdateOperatorInput
  ): Promise<Operator> => {
    const { data } = await api.put<Operator>(`/operator/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/operator/${id}`);
  },
};
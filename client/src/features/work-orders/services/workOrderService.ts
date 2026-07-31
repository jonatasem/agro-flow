import { api } from "../../../services/api";
import { type Collaborator } from "../../collaborators/services/collaboratorService";
import { type Equipment } from "../../equipments/hooks/useEquipment";

export interface SectorService {
  id: string;
  workOrderId: string;
  setor: string;
  status: "AGUARDANDO_MANUTENCAO" | "EM_MANUTENCAO" | "FINALIZADO" | "CONCLUIDO";
  qruDescricao: string;
  solucaoTecnico?: string;
  tipoCausa?: string | null;
  qth: string;
  city: string;
  criadoPorId: string;
  tecnicoResponsavelId?: string | null;
  dataCriacao?: string;
  dataInicioManutencao?: string | null;
  dataFimManutencao?: string | null;
  tempoManutencao?: number | null;
  criador?: Collaborator;
  tecnicoResponsavel?: Collaborator | null;
}

export interface WorkOrder {
  id: string;
  equipmentId: string;
  operatorId?: string | null;
  status: "ABERTA" | "EM_ANDAMENTO" | "FINALIZADA";
  createdAt?: string;
  updatedAt?: string;
  equipment?: Equipment;
  operator?: Collaborator | null;
  setores: SectorService[];
}

export interface CreateWorkOrderInput {
  fleet: string;
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
  operatorId?: string;
}

export type UpdateWorkOrderInput = Partial<{
  status: "ABERTA" | "EM_ANDAMENTO" | "FINALIZADA";
  operatorId?: string;
  equipmentId?: string;
  

  fleet?: string;
  setor?: string;
  qruDescricao?: string;
  qth?: string;
  city?: string;
}>;

export const workOrderService = {

  getAll: async (): Promise<WorkOrder[]> => {
    const response = await api.get<WorkOrder[]>("/work-order");
    return response.data;
  },

  getById: async (id: string): Promise<WorkOrder> => {
    const response = await api.get<WorkOrder>(`/work-order/${id}`);
    return response.data;
  },

  create: async (payload: CreateWorkOrderInput): Promise<WorkOrder> => {
    const response = await api.post<WorkOrder>("/work-order", payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateWorkOrderInput): Promise<WorkOrder> => {
    const response = await api.put<WorkOrder>(`/work-order/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/work-order/${id}`);
  },
};

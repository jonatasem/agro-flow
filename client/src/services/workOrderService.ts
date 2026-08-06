import { api } from "./api";
import { type Collaborator } from "./collaboratorService";
import { type Equipment } from "../hooks/useEquipment";

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

export type UpdateSectorInput = Partial<{
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
  solucaoTecnico: string;
  tipoCausa: string;
  status: string;
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

  create: async (data: CreateWorkOrderInput): Promise<WorkOrder> => {
    const response = await api.post<WorkOrder>("/work-order", data);
    return response.data;
  },

  // 🚀 Atualiza o setor individual enviando PUT para /sector-service/:sectorId
  updateSector: async (sectorId: string, data: UpdateSectorInput): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorId}`, data);
    return response.data;
  },

  // Deleta o setor via ID do setor
  deleteSector: async (sectorId: string): Promise<void> => {
    await api.delete(`/sector-service/${sectorId}`);
  },

  startSector: async (sectorServiceId: string): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/start`);
    return response.data;
  },

  finishSector: async (
    sectorServiceId: string, 
    data: { solucaoTecnico: string; tipoCausa?: string }
  ): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/finish`, data);
    return response.data;
  }
};
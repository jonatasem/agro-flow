import { api } from "./api";
import { type Collaborator } from "./collaboratorService";
import { type Equipment } from "./equipmentService";

export interface SectorService {
  id: string;
  workOrderId: string;
  setor: string;
  status: "AGUARDANDO_MANUTENCAO" | "EM_MANUTENCAO" | "PAUSADO" | "FINALIZADO";
  qruDescricao: string;
  solucaoTecnico?: string;
  tipoCausa?: string | null;
  motivoPausa?: string | null;
  qth: string;
  city: string;
  criadoPorId: string;
  tecnicoResponsavelId: string;
  dataCriacao: string;
  dataInicioManutencao?: string | null;
  dataFimManutencao?: string | null;
  tempoManutencao?: number | null;
  criador: Collaborator;
  tecnicoResponsavel: Collaborator;
}

export interface WorkOrder {
  id: string;
  equipmentId: string;
  operatorId: string;
  status: "ABERTA" | "EM_ANDAMENTO" | "FINALIZADA";
  createdAt: string;
  updatedAt?: string;
  equipment: Equipment;
  operator?: Collaborator | null;
  setores: SectorService[];
}

export interface CreateWorkOrderInput {
  fleet: string;
  operatorId: string;
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
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

  updateSector: async (sectorId: string, data: UpdateSectorInput): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorId}`, data);
    return response.data;
  },

  deleteSector: async (sectorId: string): Promise<void> => {
    await api.delete(`/sector-service/${sectorId}`);
  },

  startSector: async (sectorServiceId: string): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/start`);
    return response.data;
  },

  pauseSector: async (
    sectorServiceId: string,
    motivoPausa: string
  ): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/pause`, {
      reason: "OUTRO_MOTIVO",
      description: motivoPausa,
    });
    return response.data;
  },

  resumeSector: async (sectorServiceId: string): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/resume`);
    return response.data;
  },

  finishSector: async (
    sectorServiceId: string,
    data: { solucaoTecnico: string; tipoCausa?: string }
  ): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/finish`, data);
    return response.data;
  },
};
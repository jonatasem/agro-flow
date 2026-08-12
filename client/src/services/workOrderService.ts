import { api } from "./api";
import { type Collaborator } from "./collaboratorService";
import { type Equipment } from "../hooks/useEquipment";

export interface SectorService {
  id: string;
  workOrderId: string;
  setor: string;
  status: "AGUARDANDO_MANUTENCAO" | "EM_MANUTENCAO" | "FINALIZADO";
  qruDescricao: string;
  solucaoTecnico?: string; // pode ser nulo se ainda nao tiver concluido manutencao
  tipoCausa?: string | null; // pode ser nulo se ainda nao tiver concluido manutencao
  qth: string;
  city: string;
  criadoPorId: string;
  tecnicoResponsavelId: string;
  dataCriacao: string;
  dataInicioManutencao?: string | null; // pode ser nulo se ainda nao tiver iniciado manutencao
  dataFimManutencao?: string | null; // pode ser nulo se ainda nao tiver iniciado manutencao
  tempoManutencao?: number | null; // pode ser nulo se ainda nao tiver iniciado manutencao
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
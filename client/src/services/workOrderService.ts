import { api } from "./api";
import { type Collaborator } from "./collaboratorService";
import { type Equipment } from "./equipmentService";

// Informações do operador vinculado ao setor
export interface SectorOperator {
  id: string;
  name: string;
  registration?: string;
  city?: string;
}

// Estrutura detalhada de um setor dentro da Ordem de Serviço
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
  tecnicoResponsavelId?: string | null;
  dataCriacao: string;
  dataInicioManutencao?: string | null;
  dataFimManutencao?: string | null;
  tempoManutencao?: number | null;
  operator: SectorOperator;
  criador: Collaborator;
  tecnicoResponsavel?: Collaborator | null;
  pauses?: unknown[];
}

// Estrutura principal da Ordem de Serviço (OS)
export interface WorkOrder {
  id: string;
  equipmentId: string;
  operatorId: string;
  status: "ABERTA" | "EM_ANDAMENTO" | "FINALIZADA";
  createdAt: string;
  updatedAt?: string;
  equipment: Equipment;
  operator?: Collaborator;
  setores: SectorService[];
}

// Dados necessários para criar uma nova Ordem de Serviço
export interface CreateWorkOrderInput {
  fleet: string;
  operatorId: string;
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
}

// Campos permitidos na atualização de um setor
export type UpdateSectorInput = Partial<{
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
  solucaoTecnico: string;
  tipoCausa: string;
  status: string;
}>;

// Serviço responsável pelo gerenciamento de Ordens de Serviço e setores
export const workOrderService = {
  // Busca todas as Ordens de Serviço (com filtro opcional por status)
  getAll: async (status?: string): Promise<WorkOrder[]> => {
    const response = await api.get<WorkOrder[]>("/work-order", {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  // Busca uma Ordem de Serviço pelo ID
  getById: async (id: string): Promise<WorkOrder> => {
    const response = await api.get<WorkOrder>(`/work-order/${id}`);
    return response.data;
  },

  // Cria uma nova Ordem de Serviço
  create: async (data: CreateWorkOrderInput): Promise<WorkOrder> => {
    const response = await api.post<WorkOrder>("/work-order", data);
    return response.data;
  },

  // Atualiza os dados de um setor
  updateSector: async (sectorId: string, data: UpdateSectorInput): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorId}`, data);
    return response.data;
  },

  // Remove um setor de uma Ordem de Serviço
  deleteSector: async (sectorId: string): Promise<void> => {
    await api.delete(`/sector-service/${sectorId}`);
  },

  // Inicia o atendimento técnico de um setor
  startSector: async (sectorServiceId: string): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/start`);
    return response.data;
  },

  // Pausa o atendimento de um setor informando o motivo
  pauseSector: async (sectorServiceId: string, motivoPausa: string): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/pause`, {
      reason: "OUTRO_MOTIVO",
      description: motivoPausa,
    });
    return response.data;
  },

  // Retoma o atendimento de um setor pausado
  resumeSector: async (sectorServiceId: string): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/resume`);
    return response.data;
  },

  // Finaliza a manutenção de um setor com a solução aplicada
  finishSector: async (
    sectorServiceId: string,
    data: { solucaoTecnico: string; tipoCausa?: string }
  ): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/finish`, data);
    return response.data;
  },
};
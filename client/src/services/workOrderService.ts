import { api } from "./api";
import { type Collaborator } from "./collaboratorService";
import { type Equipment } from "./equipmentService";

// Interface para representação do operador associado ao setor
export interface SectorOperator {
  id: string;
  name: string;
  registration?: string;
  city?: string;
}

// Interface detalhada do setor dentro de uma Ordem de Serviço
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
  tempoManutencao?: number | null; // Duração em minutos
  operator: SectorOperator; // Dados do operador vinculado ao setor
  criador: Collaborator; // Usuário que abriu o chamado
  tecnicoResponsavel?: Collaborator | null; // Técnico que atendeu o setor
  pauses?: unknown[]; // Histórico de pausas do setor
}

// Interface principal da Ordem de Serviço
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

// Interface para criação de nova OS
export interface CreateWorkOrderInput {
  fleet: string;
  operatorId: string;
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
}

// Tipo parcial para atualização de um setor
export type UpdateSectorInput = Partial<{
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
  solucaoTecnico: string;
  tipoCausa: string;
  status: string;
}>;

// Métodos do serviço de Ordem de Serviço
export const workOrderService = {
  // CORREÇÃO: status agora é opcional (status?: string).
  // Se não for fornecido, não envia o filtro para a API e retorna TODAS as OS (Abertas e Finalizadas).
  getAll: async (status?: string): Promise<WorkOrder[]> => {
    const response = await api.get<WorkOrder[]>("/work-order", {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  // Busca OS por ID específico
  getById: async (id: string): Promise<WorkOrder> => {
    const response = await api.get<WorkOrder>(`/work-order/${id}`);
    return response.data;
  },

  // Cria uma nova OS
  create: async (data: CreateWorkOrderInput): Promise<WorkOrder> => {
    const response = await api.post<WorkOrder>("/work-order", data);
    return response.data;
  },

  // Atualiza os dados cadastrais de um setor
  updateSector: async (sectorId: string, data: UpdateSectorInput): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorId}`, data);
    return response.data;
  },

  // Remove um setor de uma OS
  deleteSector: async (sectorId: string): Promise<void> => {
    await api.delete(`/sector-service/${sectorId}`);
  },

  // Inicia o atendimento técnico de um setor
  startSector: async (sectorServiceId: string): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/start`);
    return response.data;
  },

  // Pausa o atendimento informando o motivo
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

  // Retoma um atendimento pausado
  resumeSector: async (sectorServiceId: string): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/resume`);
    return response.data;
  },

  // Finaliza a manutenção de um setor registrando solução e causa
  finishSector: async (
    sectorServiceId: string,
    data: { solucaoTecnico: string; tipoCausa?: string }
  ): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/finish`, data);
    return response.data;
  },
};
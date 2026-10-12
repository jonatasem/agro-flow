import { api } from "./api";

import type { SectorService } from "@/types/sectorService";
import type { UpdateSectorInput } from "@/types/sectorService";
import type { WorkOrder } from "@/types/sectorService";
import type { CreateWorkOrderInput } from "@/types/sectorService";

// Serviço responsável pelas requisições de Ordens de Serviço e respetivos setores
export const workOrderService = {
  // Lista todas as Ordens de Serviço (com filtro opcional por status)
  getAll: async (status?: string): Promise<WorkOrder[]> => {
    const response = await api.get<WorkOrder[]>("/work-order", {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  // Busca uma Ordem de Serviço específica pelo seu ID
  getById: async (id: string): Promise<WorkOrder> => {
    const response = await api.get<WorkOrder>(`/work-order/${id}`);
    return response.data;
  },

  // Cria uma nova Ordem de Serviço
  create: async (data: CreateWorkOrderInput): Promise<WorkOrder> => {
    const response = await api.post<WorkOrder>("/work-order", data);
    return response.data;
  },

  // Atualiza os dados de um setor específico
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

  // Pausa o atendimento de um setor informando a descrição do motivo
  pauseSector: async (sectorServiceId: string, motivoPausa: string): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/pause`, {
      reason: "OUTRO_MOTIVO",
      description: motivoPausa,
    });
    return response.data;
  },

  // Retoma o atendimento de um setor que estava pausado
  resumeSector: async (sectorServiceId: string): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/resume`);
    return response.data;
  },

  // Finaliza a manutenção de um setor registrando a solução técnica e opcionalmente a causa
  finishSector: async (
    sectorServiceId: string,
    data: { solucaoTecnico: string; tipoCausa?: string }
  ): Promise<SectorService> => {
    const response = await api.put<SectorService>(`/sector-service/${sectorServiceId}/finish`, data);
    return response.data;
  },
};
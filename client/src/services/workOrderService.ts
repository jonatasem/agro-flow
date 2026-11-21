import { api } from "./api";
import type {
  CreateWorkOrderInput,
  SectorService,
  UpdateSectorInput,
  WorkOrder,
} from "@/types/sectorService";

export const workOrderService = {
  getAll: async (status?: string): Promise<WorkOrder[]> => {
    const { data } = await api.get<WorkOrder[]>("/work-order", {
      params: status ? { status } : undefined,
    });
    return data;
  },

  getById: async (id: string): Promise<WorkOrder> => {
    const { data } = await api.get<WorkOrder>(`/work-order/${id}`);
    return data;
  },

  create: async (payload: CreateWorkOrderInput): Promise<WorkOrder> => {
    const { data } = await api.post<WorkOrder>("/work-order", payload);
    return data;
  },

  updateSector: async (
    sectorId: string,
    payload: UpdateSectorInput
  ): Promise<SectorService> => {
    const { data } = await api.put<SectorService>(
      `/sector-service/${sectorId}`,
      payload
    );
    return data;
  },

  deleteSector: async (sectorId: string): Promise<void> => {
    await api.delete(`/sector-service/${sectorId}`);
  },

  startSector: async (sectorServiceId: string): Promise<SectorService> => {
    const { data } = await api.put<SectorService>(
      `/sector-service/${sectorServiceId}/start`
    );
    return data;
  },

  pauseSector: async (
    sectorServiceId: string,
    motivoPausa: string
  ): Promise<SectorService> => {
    const { data } = await api.put<SectorService>(
      `/sector-service/${sectorServiceId}/pause`,
      {
        reason: "OUTRO_MOTIVO",
        description: motivoPausa,
      }
    );
    return data;
  },

  resumeSector: async (sectorServiceId: string): Promise<SectorService> => {
    const { data } = await api.put<SectorService>(
      `/sector-service/${sectorServiceId}/resume`
    );
    return data;
  },

  finishSector: async (
    sectorServiceId: string,
    payload: { solucaoTecnico: string; tipoCausa?: string }
  ): Promise<SectorService> => {
    const { data } = await api.put<SectorService>(
      `/sector-service/${sectorServiceId}/finish`,
      payload
    );
    return data;
  },
};
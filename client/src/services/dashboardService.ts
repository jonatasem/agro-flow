import { api } from "./api";

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  equipmentId?: string;
  operatorId?: string;
  tecnicoId?: string;
  setor?: string;
  tipoCausa?: string;
}

export interface DashboardMetrics {
  overview: {
    totalWorkOrders: number;
    totalDowntimeMinutes: number;
    totalDowntimeHours: number;
    averageRepairTimeMinutes: number;
  };
  causesDistribution: Record<string, number>;
  topProblematicEquipments: Array<{
    fleet: string;
    name: string;
    count: number;
    totalMinutes: number;
  }>;
  topRequestingOperators: Array<{
    name: string;
    totalOS: number;
    causes: Record<string, number>;
  }>;
  timeline: Array<{
    date: string;
    count: number;
  }>;
}

export const dashboardService = {
  getMetrics: async (filters?: DashboardFilters): Promise<DashboardMetrics> => {
    const response = await api.get<DashboardMetrics>("/metrics", {
      params: filters,
    });
    return response.data;
  },
};
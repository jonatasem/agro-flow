import { api } from "./api";

// Filtros disponíveis para a consulta de métricas no dashboard
export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  equipmentId?: string;
  operatorId?: string;
  tecnicoId?: string;
  setor?: string;
  tipoCausa?: string;
}

// Estrutura dos dados consolidados exibidos no dashboard
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

// Serviço responsável pelas consultas do dashboard
export const dashboardService = {
  // Busca as métricas e relatórios aplicando os filtros selecionados
  getMetrics: async (filters?: DashboardFilters): Promise<DashboardMetrics> => {
    const response = await api.get<DashboardMetrics>("/metrics", {
      params: filters,
    });
    return response.data;
  },
};
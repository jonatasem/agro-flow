import { api } from "./api";
import type { DashboardFilters, DashboardMetrics } from "../types/dashboard";

export const dashboardService = {
  getMetrics: async (filters: DashboardFilters = {}): Promise<DashboardMetrics> => {
    const cleanParams: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanParams[key] = String(value);
      }
    });

    const response = await api.get<DashboardMetrics>("/metrics", {
      params: cleanParams,
    });

    return response.data;
  },
};
import { useState, useEffect, useCallback } from "react";
import { AxiosError } from "axios";
import { dashboardService, type DashboardFilters, type DashboardMetrics } from "../services/dashboardService";

export function useDashboardMetrics(initialFilters?: DashboardFilters) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(() => initialFilters || {});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      try {
        const data = await dashboardService.getMetrics(filters);
        if (!isCancelled) {
          setMetrics(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error("Erro ao carregar métricas do dashboard:", err);
          let message = "Falha ao carregar os dados do dashboard.";
          if (err instanceof AxiosError && err.response?.data?.message) {
            message = err.response.data.message;
          }
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [filters]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getMetrics(filters);
      setMetrics(data);
    } catch (err: unknown) {
      console.error("Erro ao carregar métricas do dashboard:", err);
      let message = "Falha ao carregar os dados do dashboard.";
      if (err instanceof AxiosError && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((action: React.SetStateAction<DashboardFilters>) => {
    setLoading(true);
    setFilters(action);
  }, []);

  return {
    metrics,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    refetch,
  };
}
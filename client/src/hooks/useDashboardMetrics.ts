import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "../services/dashboardMetrics";
import { getErrorMessage } from "../utils/getErrorMessage";
import type { DashboardFilters, DashboardMetrics } from "../types/dashboard";

export function useDashboardMetrics(initialFilters?: DashboardFilters) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(() => initialFilters || {});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getMetrics(filters);
      setMetrics(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Falha ao carregar dados do dashboard."));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getMetrics(filters);
        if (active) {
          setMetrics(data);
        }
      } catch (err: unknown) {
        if (active) {
          setError(getErrorMessage(err, "Falha ao carregar dados do dashboard."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [filters]);

  return {
    metrics,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchMetrics,
  };
}
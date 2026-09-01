import { useState, useEffect, useCallback } from "react";

// Serviços e Tipos
import {
  dashboardService,
  type DashboardFilters,
  type DashboardMetrics,
} from "../services/dashboardService";

// Utilitários
import { getErrorMessage } from "../utils/getErrorMessage";

export type { DashboardFilters, DashboardMetrics };

// Hook customizado para consulta e filtragem de métricas e indicadores do dashboard
export function useDashboardMetrics(initialFilters?: DashboardFilters) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(
    () => initialFilters || {}
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Busca manual/recarregamento das métricas com os filtros atuais
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

  // Carregamento reativo sempre que os filtros forem alterados
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getMetrics(filters);
        if (isMounted) {
          setMetrics(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            getErrorMessage(err, "Falha ao carregar dados do dashboard.")
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Atualização dos filtros aplicados
  const updateFilters = useCallback(
    (action: React.SetStateAction<DashboardFilters>) => {
      setLoading(true);
      setFilters(action);
    },
    []
  );

  return {
    metrics,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    refetch: fetchMetrics,
  };
}
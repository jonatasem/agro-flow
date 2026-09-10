import { useState, useEffect } from "react";
import { api } from "../services/api";
import type { DashboardData } from "../types/metrics";

export function useDashboardMetrics() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<DashboardData>("/metrics");
        setData(response.data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as métricas do servidor.");
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  return { data, loading, error };
}
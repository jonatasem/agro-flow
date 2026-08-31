import { useState, useEffect, useCallback } from "react";
import { workOrderService, type WorkOrder } from "../services/workOrderService";
import { getErrorMessage } from "../utils/getErrorMessage";

export function useHistory() {
  const [completedWorkOrders, setCompletedWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await workOrderService.getAll("FINALIZADA");
      setCompletedWorkOrders(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar o histórico de Ordens de Serviço."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setLoading(true);
        setError("");
        const data = await workOrderService.getAll("FINALIZADA");
        if (isMounted) {
          setCompletedWorkOrders(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(getErrorMessage(err, "Erro ao carregar o histórico de Ordens de Serviço."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    completedWorkOrders,
    loading,
    error,
    refetch: fetchHistory,
  };
}
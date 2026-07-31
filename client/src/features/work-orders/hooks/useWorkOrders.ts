import { useState, useEffect, useCallback } from "react";
import { workOrderService, type WorkOrder } from "../services/workOrderService";
import { getErrorMessage } from "../../../utility/getErrorMessage";

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await workOrderService.getAll();
      setWorkOrders(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar Ordens de Serviço."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setError("");
        const data = await workOrderService.getAll();
        if (isMounted) {
          setWorkOrders(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(getErrorMessage(err, "Erro ao carregar Ordens de Serviço."));
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
  }, []);

  return {
    workOrders,
    loading,
    error,
    refetch: fetchWorkOrders,
  };
}

import { useState, useEffect, useCallback } from "react";
import { workOrderService } from "@/services/workOrderService";
import { getErrorMessage } from "@/utils/getErrorMessage";
import type { CreateWorkOrderInput, WorkOrder } from "@/types/sectorService";

export function useWorkOrders(status: string = "ABERTA") {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await workOrderService.getAll(status);
      setWorkOrders(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar Ordens de Serviço."));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createWorkOrder = async (payload: CreateWorkOrderInput) => {
    try {
      const created = await workOrderService.create(payload);
      setWorkOrders((prev) => [...prev, created]);
      return created;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao criar Ordem de Serviço."), {
        cause: err,
      });
    }
  };

  return {
    workOrders,
    loading,
    error,
    refetch,
    createWorkOrder,
  };
}
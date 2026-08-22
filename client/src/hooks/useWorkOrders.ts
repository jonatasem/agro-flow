import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { getErrorMessage } from "../utils/getErrorMessage";
import { type WorkOrder } from "../services/workOrderService";

export type { WorkOrder };

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Função para recarregamento manual (ex: botão de refetch ou após ações)
  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<WorkOrder[]>("/work-order");
      setWorkOrders(response.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar Ordens de Serviço."));
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca inicial executada com a montagem do componente
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const response = await api.get<WorkOrder[]>("/work-order");
        if (isMounted) {
          setWorkOrders(response.data);
          setError("");
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

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const createWorkOrder = async (payload: Partial<WorkOrder>) => {
    try {
      const response = await api.post<WorkOrder>("/work-order", payload);
      setWorkOrders((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao criar Ordem de Serviço."), { cause: err });
    }
  };

  const updateWorkOrder = async (id: string, payload: Partial<WorkOrder>) => {
    try {
      const response = await api.put<WorkOrder>(`/work-order/${id}`, payload);
      setWorkOrders((prev) => prev.map((item) => (item.id === id ? response.data : item)));
      return response.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar Ordem de Serviço."), { cause: err });
    }
  };

  const deleteWorkOrder = async (id: string) => {
    try {
      await api.delete(`/work-order/${id}`);
      setWorkOrders((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao remover Ordem de Serviço."), { cause: err });
    }
  };

  return {
    workOrders,
    loading,
    error,
    refetch: fetchWorkOrders,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
  };
}
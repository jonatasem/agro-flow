import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { getErrorMessage } from "../utils/getErrorMessage";
import { workOrderService, type WorkOrder } from "../services/workOrderService";

export type { WorkOrder };

export function useWorkOrders(status: string = "ABERTA") {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Função para recarregamento manual (refetch) utilizando o parâmetro de status
  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await workOrderService.getAll(status);
      setWorkOrders(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar Ordens de Serviço."));
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Carregamento inicial ao montar o componente ou alterar o status selecionado
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setLoading(true);
        setError("");
        const data = await workOrderService.getAll(status);
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

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [status]);

  // Função auxiliar para criação de OS no estado local
  const createWorkOrder = async (payload: Partial<WorkOrder>) => {
    try {
      const response = await api.post<WorkOrder>("/work-order", payload);
      setWorkOrders((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao criar Ordem de Serviço."), { cause: err });
    }
  };

  // Função auxiliar para atualização no estado local
  const updateWorkOrder = async (id: string, payload: Partial<WorkOrder>) => {
    try {
      const response = await api.put<WorkOrder>(`/work-order/${id}`, payload);
      setWorkOrders((prev) => prev.map((item) => (item.id === id ? response.data : item)));
      return response.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar Ordem de Serviço."), { cause: err });
    }
  };

  // Função auxiliar para exclusão no estado local
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
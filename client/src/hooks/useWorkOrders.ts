import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { getErrorMessage } from "../utility/getErrorMessage";
import { type WorkOrder } from "../services/workOrderService";

export type { WorkOrder };

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setError("");
        const response = await api.get<WorkOrder[]>("/work-order");
        if (isMounted) {
          setWorkOrders(response.data);
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

  const startSectorService = async (sectorServiceId: string) => {
    try {
      await api.put(`/sector-service/${sectorServiceId}/start`);
      await fetchWorkOrders();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao iniciar atendimento."), { cause: err });
    }
  };

  const pauseSectorService = async (sectorServiceId: string, description: string, reason = "OUTRO_MOTIVO") => {
    try {
      await api.put(`/sector-service/${sectorServiceId}/pause`, { reason, description });
      await fetchWorkOrders();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao pausar atendimento."), { cause: err });
    }
  };

  const resumeSectorService = async (sectorServiceId: string) => {
    try {
      await api.put(`/sector-service/${sectorServiceId}/resume`);
      await fetchWorkOrders();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao retomar atendimento."), { cause: err });
    }
  };

  const finishSectorService = async (sectorServiceId: string, payload?: { solucaoTecnico: string; tipoCausa?: string }) => {
    try {
      await api.put(`/sector-service/${sectorServiceId}/finish`, payload);
      await fetchWorkOrders();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao finalizar atendimento."), { cause: err });
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
    startSectorService,
    pauseSectorService,
    resumeSectorService,
    finishSectorService,
  };
}
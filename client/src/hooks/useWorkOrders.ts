import { useState, useEffect, useCallback } from "react";
import { getWorkOrders, type WorkOrder } from "../services/workOrder";
import { getErrorMessage } from "../utility/getErrorMessage";

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Função para recarregar manualmente (ex: ao clicar no botão 'Atualizar')
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getWorkOrders();
      setWorkOrders(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar Ordens de Serviço."));
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca inicial sem causar setState síncrono no efeito
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setError("");
        const data = await getWorkOrders();
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
    refetch,
  };
}

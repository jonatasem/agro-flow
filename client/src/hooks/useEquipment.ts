import { useState, useEffect, useCallback } from "react";
import { getEquipments, type EquipmentInfo } from "../services/workOrder";
import { getErrorMessage } from "../utility/getErrorMessage";

export function useEquipments() {
  const [equipments, setEquipments] = useState<EquipmentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getEquipments();
      setEquipments(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar equipamentos."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setError("");
        const data = await getEquipments();
        if (isMounted) {
          setEquipments(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(getErrorMessage(err, "Erro ao carregar equipamentos."));
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
    equipments,
    loading,
    error,
    refetch,
  };
}

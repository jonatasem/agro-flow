import { useState, useEffect, useCallback } from "react";
import { api } from "../../../services/api";
import { getErrorMessage } from "../../../utility/getErrorMessage";

export interface Equipment {
  id: string;
  fleet: string;
  name: string;
  createdAt?: string;
}

export interface CreateEquipmentInput {
  fleet: string;
  name: string;
}

export interface UpdateEquipmentInput {
  fleet?: string;
  name?: string;
}

export function useEquipments() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. READ ALL (Aponta direto para a rota /equipment)
  const fetchEquipments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<Equipment[]>("/equipment");
      setEquipments(response.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar equipamentos."));
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial do ciclo de vida do componente
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setError("");
        const response = await api.get<Equipment[]>("/equipment");
        if (isMounted) {
          setEquipments(response.data);
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

  // 2. CREATE
  const createEquipment = async (payload: CreateEquipmentInput) => {
    try {
      const response = await api.post<Equipment>("/equipment", payload);
      setEquipments((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao criar equipamento."), { cause: err });
    }
  };

  // 3. UPDATE
  const updateEquipment = async (id: string, payload: UpdateEquipmentInput) => {
    try {
      const response = await api.put<Equipment>(`/equipment/${id}`, payload);
      setEquipments((prev) => prev.map((item) => (item.id === id ? response.data : item)));
      return response.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar equipamento."), { cause: err });
    }
  };

  // 4. DELETE
  const deleteEquipment = async (id: string) => {
    try {
      await api.delete(`/equipment/${id}`);
      setEquipments((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao remover equipamento."), { cause: err });
    }
  };

  return {
    equipments,
    loading,
    error,
    refetch: fetchEquipments,
    createEquipment,
    updateEquipment,
    deleteEquipment,
  };
}

import { useState, useEffect, useCallback } from "react";
import {
  equipmentService,
  type Equipment,
  type CreateEquipmentInput,
  type UpdateEquipmentInput,
} from "../services/equipmentService";
import { getErrorMessage } from "../utility/getErrorMessage";

export type { Equipment, CreateEquipmentInput, UpdateEquipmentInput };

export function useEquipments() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEquipments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await equipmentService.getAll();
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
        const data = await equipmentService.getAll();
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

  const createEquipment = async (payload: CreateEquipmentInput) => {
    try {
      const response = await equipmentService.create(payload);
      setEquipments((prev) => [...prev, response]);
      return response;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao criar equipamento."), { cause: err });
    }
  };

  const updateEquipment = async (id: string, payload: UpdateEquipmentInput) => {
    try {
      const response = await equipmentService.update(id, payload);
      setEquipments((prev) => prev.map((item) => (item.id === id ? response : item)));
      return response;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar equipamento."), { cause: err });
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      await equipmentService.delete(id);
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
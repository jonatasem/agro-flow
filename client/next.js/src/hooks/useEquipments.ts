import { useState, useEffect, useCallback } from "react";
import {
  equipmentService,
  type CreateEquipmentInput,
  type UpdateEquipmentInput,
} from "@/services/equipmentService";
import { getErrorMessage } from "@/utils/getErrorMessage";

import type { Equipment } from "@/types/equipment";

export type { Equipment, CreateEquipmentInput, UpdateEquipmentInput };

export function useEquipments() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Recarrega a lista de equipamentos
  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await equipmentService.getAll();
      setEquipments(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar equipamentos."));
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca inicial
  useEffect(() => {
    let isMounted = true;

    equipmentService
      .getAll()
      .then((data) => {
        if (isMounted) setEquipments(data);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(getErrorMessage(err, "Erro ao carregar equipamentos."));
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Criação de equipamento
  const createEquipment = async (payload: CreateEquipmentInput) => {
    try {
      const response = await equipmentService.create(payload);
      setEquipments((prev) => [...prev, response]);
      return response;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao criar equipamento."), {
        cause: err,
      });
    }
  };

  // Atualização de equipamento
  const updateEquipment = async (id: string, payload: UpdateEquipmentInput) => {
    try {
      const response = await equipmentService.update(id, payload);
      setEquipments((prev) =>
        prev.map((item) => (item.id === id ? response : item))
      );
      return response;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar equipamento."), {
        cause: err,
      });
    }
  };

  // Eliminação de equipamento
  const deleteEquipment = async (id: string) => {
    try {
      await equipmentService.delete(id);
      setEquipments((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao remover equipamento."), {
        cause: err,
      });
    }
  };

  return {
    equipments,
    loading,
    error,
    refetch,
    createEquipment,
    updateEquipment,
    deleteEquipment,
  };
}
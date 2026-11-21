// src/hooks/useEquipments.ts
import {
  equipmentService,
  type CreateEquipmentInput,
  type UpdateEquipmentInput,
} from "@/services/equipmentService";
import { useCrudResource } from "./useCrudResource";

export type { CreateEquipmentInput, UpdateEquipmentInput };

export function useEquipments() {
  const crud = useCrudResource(equipmentService, {
    loadError: "Erro ao carregar equipamentos.",
    createError: "Erro ao criar equipamento.",
    updateError: "Erro ao atualizar equipamento.",
    deleteError: "Erro ao remover equipamento.",
  });

  return {
    equipments: crud.items,
    loading: crud.loading,
    error: crud.error,
    refetch: crud.refetch,
    createEquipment: crud.createItem,
    updateEquipment: crud.updateItem,
    deleteEquipment: crud.deleteItem,
  };
}
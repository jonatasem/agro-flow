// src/hooks/useOperators.ts
import {
  operatorService,
  type CreateOperatorInput,
  type UpdateOperatorInput,
} from "@/services/operatorService";
import { useCrudResource } from "./useCrudResource";

export type { CreateOperatorInput, UpdateOperatorInput };

export function useOperators() {
  const crud = useCrudResource(operatorService, {
    loadError: "Erro ao carregar operadores.",
    createError: "Erro ao criar operador.",
    updateError: "Erro ao atualizar operador.",
    deleteError: "Erro ao remover operador.",
  });

  return {
    operators: crud.items,
    loading: crud.loading,
    error: crud.error,
    refetch: crud.refetch,
    createOperator: crud.createItem,
    updateOperator: crud.updateItem,
    deleteOperator: crud.deleteItem,
  };
}
// src/hooks/useCollaborator.ts
import {
  collaboratorService,
  type CreateCollaboratorInput,
  type UpdateCollaboratorInput,
} from "@/services/collaboratorService";
import { useCrudResource } from "./useCrudResource";

export type { CreateCollaboratorInput, UpdateCollaboratorInput };

export function useCollaborator() {
  const crud = useCrudResource(collaboratorService, {
    loadError: "Erro ao carregar colaboradores.",
    createError: "Erro ao criar colaborador.",
    updateError: "Erro ao atualizar colaborador.",
    deleteError: "Erro ao remover colaborador.",
  });

  const toggleStatus = (id: string, status: boolean) =>
    crud.updateItem(id, { status });

  return {
    collaborators: crud.items,
    loading: crud.loading,
    error: crud.error,
    refetch: crud.refetch,
    createCollaborator: crud.createItem,
    updateCollaborator: crud.updateItem,
    toggleStatus,
    deleteCollaborator: crud.deleteItem,
  };
}
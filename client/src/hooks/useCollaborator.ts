import { useState, useEffect, useCallback } from "react";
import {
  collaboratorService,
  type CreateCollaboratorInput,
  type UpdateCollaboratorInput,
} from "@/services/collaboratorService";
import { getErrorMessage } from "@/utils/getErrorMessage";
import type { Collaborator } from "@/types/collaborator";

export type { Collaborator, CreateCollaboratorInput, UpdateCollaboratorInput };

async function runMutation<T>(
  operation: () => Promise<T>,
  fallbackMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, fallbackMessage), { cause: err });
  }
}

export function useCollaborator() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await collaboratorService.getAll();
      setCollaborators(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar colaboradores."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createCollaborator = async (payload: CreateCollaboratorInput) => {
    const created = await runMutation(
      () => collaboratorService.create(payload),
      "Erro ao criar colaborador."
    );
    setCollaborators((prev) => [...prev, created]);
    return created;
  };

  const updateCollaborator = async (
    id: string,
    payload: UpdateCollaboratorInput
  ) => {
    const updated = await runMutation(
      () => collaboratorService.update(id, payload),
      "Erro ao atualizar colaborador."
    );
    setCollaborators((prev) =>
      prev.map((item) => (item.id === id ? updated : item))
    );
    return updated;
  };

  const toggleStatus = async (id: string, status: boolean) => {
    const updated = await runMutation(
      () => collaboratorService.update(id, { status } as UpdateCollaboratorInput),
      "Erro ao alterar estado do colaborador."
    );
    setCollaborators((prev) =>
      prev.map((item) => (item.id === id ? updated : item))
    );
    return updated;
  };

  const deleteCollaborator = async (id: string) => {
    await runMutation(
      () => collaboratorService.delete(id),
      "Erro ao remover colaborador."
    );
    setCollaborators((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    collaborators,
    loading,
    error,
    refetch,
    createCollaborator,
    updateCollaborator,
    toggleStatus,
    deleteCollaborator,
  };
}
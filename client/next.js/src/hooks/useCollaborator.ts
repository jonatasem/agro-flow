import { useState, useEffect, useCallback } from "react";
import {
  collaboratorService,
  type CreateCollaboratorInput,
  type UpdateCollaboratorInput,
} from "@/services/collaboratorService";
import { getErrorMessage } from "@/utils/getErrorMessage";
import type { Collaborator } from "@/types/collaborator";

export type { Collaborator, CreateCollaboratorInput, UpdateCollaboratorInput };

// Gestão do estado e operações de CRUD de colaboradores.
export function useCollaborator() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Recarrega a lista de colaboradores
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

  // Busca inicial
  useEffect(() => {
    let isMounted = true;

    collaboratorService
      .getAll()
      .then((data) => {
        if (isMounted) setCollaborators(data);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(getErrorMessage(err, "Erro ao carregar colaboradores."));
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Criação de colaborador
  const createCollaborator = async (payload: CreateCollaboratorInput) => {
    try {
      const response = await collaboratorService.create(payload);
      setCollaborators((prev) => [...prev, response]);
      return response;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao criar colaborador."), {
        cause: err,
      });
    }
  };

  // Atualização de colaborador
  const updateCollaborator = async (id: string, payload: UpdateCollaboratorInput) => {
    try {
      const response = await collaboratorService.update(id, payload);
      setCollaborators((prev) =>
        prev.map((item) => (item.id === id ? response : item))
      );
      return response;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar colaborador."), {
        cause: err,
      });
    }
  };

  // Alterna o estado (Ativo / Inativo) do colaborador
  const toggleStatus = async (id: string, newStatus: boolean) => {
    try {
      const response = await collaboratorService.update(id, {
        status: newStatus,
      } as UpdateCollaboratorInput);

      setCollaborators((prev) =>
        prev.map((item) => (item.id === id ? response : item))
      );
      return response;
    } catch (err: unknown) {
      throw new Error(
        getErrorMessage(err, "Erro ao alterar estado do colaborador."),
        { cause: err }
      );
    }
  };

  // Eliminação de colaborador
  const deleteCollaborator = async (id: string) => {
    try {
      await collaboratorService.delete(id);
      setCollaborators((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao remover colaborador."), {
        cause: err,
      });
    }
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
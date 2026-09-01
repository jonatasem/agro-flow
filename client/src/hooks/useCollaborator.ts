import { useState, useEffect, useCallback } from "react";

// Serviços e Tipos
import {
  collaboratorService,
  type Collaborator,
  type CreateCollaboratorInput,
  type UpdateCollaboratorInput,
} from "../services/collaboratorService";

// Utilitários
import { getErrorMessage } from "../utils/getErrorMessage";

export type { Collaborator, CreateCollaboratorInput, UpdateCollaboratorInput };

// Hook customizado para gerenciamento do estado e operações de CRUD de colaboradores
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

  // Busca inicial com controle de desmontagem do componente
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
  const updateCollaborator = async (
    id: string,
    payload: UpdateCollaboratorInput
  ) => {
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

  // Exclusão de colaborador
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
    deleteCollaborator,
  };
}
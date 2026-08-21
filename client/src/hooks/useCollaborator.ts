import { useState, useEffect, useCallback } from "react";
import {
  collaboratorService,
  type Collaborator,
  type CreateCollaboratorInput,
  type UpdateCollaboratorInput,
} from "../services/collaboratorService";
import { getErrorMessage } from "../utility/getErrorMessage";

export type { Collaborator, CreateCollaboratorInput, UpdateCollaboratorInput };

export function useCollaborator() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCollaborators = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await collaboratorService.getAll();
      setCollaborators(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar colaboradores."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setError("");
        const data = await collaboratorService.getAll();
        if (isMounted) {
          setCollaborators(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(getErrorMessage(err, "Erro ao carregar colaboradores."));
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

  const createCollaborator = async (payload: CreateCollaboratorInput) => {
    try {
      const response = await collaboratorService.create(payload);
      setCollaborators((prev) => [...prev, response]);
      return response;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao criar colaborador."), { cause: err });
    }
  };

  const updateCollaborator = async (id: string, payload: UpdateCollaboratorInput) => {
    try {
      const response = await collaboratorService.update(id, payload);
      setCollaborators((prev) => prev.map((item) => (item.id === id ? response : item)));
      return response;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar colaborador."), { cause: err });
    }
  };

  const deleteCollaborator = async (id: string) => {
    try {
      await collaboratorService.delete(id);
      setCollaborators((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao remover colaborador."), { cause: err });
    }
  };

  return {
    collaborators,
    loading,
    error,
    refetch: fetchCollaborators,
    createCollaborator,
    updateCollaborator,
    deleteCollaborator,
  };
}
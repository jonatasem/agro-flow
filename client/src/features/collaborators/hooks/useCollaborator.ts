import { useState, useEffect, useCallback } from "react";
import {
  collaboratorService,
  type Collaborator,
  type CreateCollaboratorInput,
  type UpdateCollaboratorInput,
} from "../services/collaboratorService";
import { getErrorMessage } from "../../../utility/getErrorMessage";

export function useCollaborator() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Com refetch para o botão manual
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

  // Carregamento inicial
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

  // CREATE
  const createCollaborator = async (payload: CreateCollaboratorInput) => {
    try {
      const newItem = await collaboratorService.create(payload);
      setCollaborators((prev) => [...prev, newItem]);
      return newItem;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao criar colaborador."), { cause: err });
    }
  };

  // UPDATE
  const updateCollaborator = async (id: string, payload: UpdateCollaboratorInput) => {
    try {
      const updatedItem = await collaboratorService.update(id, payload);
      setCollaborators((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
      return updatedItem;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar colaborador."), { cause: err });
    }
  };

  // DELETE
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

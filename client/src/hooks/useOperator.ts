import { useState, useEffect, useCallback } from "react";

// Serviços e Tipos
import {
  operatorService,
  type Operator,
  type CreateOperatorInput,
  type UpdateOperatorInput,
} from "../services/operatorService";

// Utilitários
import { getErrorMessage } from "../utils/getErrorMessage";

export type { Operator, CreateOperatorInput, UpdateOperatorInput };

// Hook customizado para gerenciamento do estado e operações de CRUD de operadores
export function useOperators() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Recarrega a lista de operadores
  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await operatorService.getAll();
      setOperators(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar operadores."));
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca inicial com controle de desmontagem do componente
  useEffect(() => {
    let isMounted = true;

    operatorService
      .getAll()
      .then((data) => {
        if (isMounted) setOperators(data);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(getErrorMessage(err, "Erro ao carregar operadores."));
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Criação de operador
  const createOperator = async (payload: CreateOperatorInput) => {
    try {
      const response = await operatorService.create(payload);
      setOperators((prev) => [...prev, response]);
      return response;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao criar operador."), {
        cause: err,
      });
    }
  };

  // Atualização de operador
  const updateOperator = async (
    id: string,
    payload: UpdateOperatorInput
  ) => {
    try {
      const response = await operatorService.update(id, payload);
      setOperators((prev) =>
        prev.map((item) => (item.id === id ? response : item))
      );
      return response;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar operador."), {
        cause: err,
      });
    }
  };

  // Exclusão de operador
  const deleteOperator = async (id: string) => {
    try {
      await operatorService.delete(id);
      setOperators((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao remover operador."), {
        cause: err,
      });
    }
  };

  return {
    operators,
    loading,
    error,
    refetch,
    createOperator,
    updateOperator,
    deleteOperator,
  };
}
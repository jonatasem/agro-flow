import { useState, useEffect, useCallback } from "react";
import {
  operatorService,
  type Operator,
  type CreateOperatorInput,
  type UpdateOperatorInput,
} from "../services/operatorService";
import { getErrorMessage } from "../utility/getErrorMessage";

export type { Operator, CreateOperatorInput, UpdateOperatorInput };

export function useOperators() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOperators = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await operatorService.getAll();
      setOperators(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar operadores."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setError("");
        const data = await operatorService.getAll();
        if (isMounted) {
          setOperators(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(getErrorMessage(err, "Erro ao carregar operadores."));
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

  const createOperator = async (payload: CreateOperatorInput) => {
    try {
      const response = await operatorService.create(payload);
      setOperators((prev) => [...prev, response]);
      return response;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao criar operador."), { cause: err });
    }
  };

  const updateOperator = async (id: string, payload: UpdateOperatorInput) => {
    try {
      const response = await operatorService.update(id, payload);
      setOperators((prev) => prev.map((item) => (item.id === id ? response : item)));
      return response;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar operador."), { cause: err });
    }
  };

  const deleteOperator = async (id: string) => {
    try {
      await operatorService.delete(id);
      setOperators((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao remover operador."), { cause: err });
    }
  };

  return {
    operators,
    loading,
    error,
    refetch: fetchOperators,
    createOperator,
    updateOperator,
    deleteOperator,
  };
}
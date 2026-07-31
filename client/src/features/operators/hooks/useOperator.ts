import { useState, useEffect, useCallback } from "react";
import { api } from "../../../services/api";
import { getErrorMessage } from "../../../utility/getErrorMessage";

export interface Operator {
  id: string;
  name: string;
  registration: string;
  city?: string;
  createdAt?: string;
}

export interface CreateOperatorInput {
  name: string;
  registration: string;
  city?: string;
  password?: string;
}

export interface UpdateOperatorInput {
  name?: string;
  registration?: string;
  city?: string;
  password?: string;
}

export function useOperators() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOperators = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<Operator[]>("/operator");
      setOperators(response.data);
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
        const response = await api.get<Operator[]>("/operator");
        if (isMounted) {
          setOperators(response.data);
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
      const response = await api.post<Operator>("/operator", payload);
      setOperators((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao criar operador."), { cause: err });
    }
  };

  const updateOperator = async (id: string, payload: UpdateOperatorInput) => {
    try {
      const response = await api.put<Operator>(`/operator/${id}`, payload);
      setOperators((prev) => prev.map((item) => (item.id === id ? response.data : item)));
      return response.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar operador."), { cause: err });
    }
  };

  const deleteOperator = async (id: string) => {
    try {
      await api.delete(`/operator/${id}`);
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

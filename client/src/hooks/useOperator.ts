import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { getErrorMessage } from "../utility/getErrorMessage";

//interface for Operator
export interface Operator {
  id: string;           
  name: string;         
  registration: string; 
  city?: string;        
  createdAt?: string;   
}

// interface for Operator input data when creating an operator
export interface CreateOperatorInput {
  name: string;         
  registration: string; 
  city?: string;        
  password?: string;    
}


// interface for Operator input data when updating an operator
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

  // Função useCallback para buscar operadores, evitando recriação em cada renderização.
  const fetchOperators = useCallback(async () => {
    try {
      setLoading(true); // Liga o indicador visual de processamento.
      setError("");     // Limpa rastros de erros anteriores.
      const response = await api.get<Operator[]>("/operator");
      setOperators(response.data); // Sincroniza a resposta no estado local de operadores.
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar operadores.")); // Captura e trata erros.
    } finally {
      setLoading(false); // Desliga o indicador visual de carregamento.
    }
  }, []); // Dependências vazias mantêm a mesma referência de função durante todo o ciclo de vida.

  useEffect(() => {
    // Flag de controle para evitar a atualização de estados em componentes desativados do DOM (Evita Memory Leak).
    let isMounted = true;

    async function loadData() {
      try {
        setError("");
        const response = await api.get<Operator[]>("/operator");
        // Se o usuário ainda estiver na tela ao término da requisição, atualiza os dados locais.
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

    loadData(); // Dispara o método interno assíncrono.

    // Função de limpeza (cleanup) executada quando o componente de tela é desmontado.
    return () => {
      isMounted = false; // Altera a flag inviabilizando atualizações pendentes e tardias da API.
    };
  }, []); // Array de dependências vazio garante disparo único na inicialização do componente.

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

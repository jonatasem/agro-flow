import { useState, useEffect, useCallback } from "react";
import { getCollaborators, type CollaboratorInfo } from "../services/workOrder";
import { getErrorMessage } from "../utility/getErrorMessage";

export function useOperators() {
  const [operators, setOperators] = useState<CollaboratorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Função para recarregar manualmente (ex: botão 'Atualizar')
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCollaborators();
      
      // Filtra apenas colaboradores cujo cargo/role contenha "operador"
      const opList = data.filter((c) =>
        c.role.toLowerCase().includes("operador")
      );
      
      setOperators(opList);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar operadores."));
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial sem causar atualização síncrona de estado no useEffect
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setError("");
        const data = await getCollaborators();
        
        const opList = data.filter((c) =>
          c.role.toLowerCase().includes("operador")
        );

        if (isMounted) {
          setOperators(opList);
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

  return {
    operators,
    loading,
    error,
    refetch,
  };
}

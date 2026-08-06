import { useState, useEffect, useCallback } from "react";
import { workOrderService, type WorkOrder } from "../services/workOrderService";
import { getErrorMessage } from "../utility/getErrorMessage";

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Memoriza a função de busca usando useCallback para evitar que ela seja recriada a cada renderização da página.
  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      // Executa a chamada HTTP para obter todas as ordens de serviço.
      const data = await workOrderService.getAll();
      // Atualiza o estado com as novas ordens recebidas.
      setWorkOrders(data);
    } catch (err: unknown) {
      // Captura a falha, trata o formato e atualiza a mensagem de erro na tela.
      setError(getErrorMessage(err, "Erro ao carregar Ordens de Serviço."));
    } finally {
      // Garante o desligamento do indicador de carregamento após o término da requisição.
      setLoading(false);
    }
  }, []); // Array de dependências vazio indica que esta função nunca mudará de referência na memória.

  // Efeito colateral executado automaticamente apenas uma vez quando o componente é montado na tela.
  useEffect(() => {
    // Variável de controle para verificar se o componente ainda continua ativo/montado na tela.
    let isMounted = true;

    // Função interna assíncrona responsável por disparar a carga inicial de dados.
    async function loadData() {
      try {
        // Limpa possíveis mensagens de erro antigas.
        setError("");
        // Faz a requisição inicial para trazer as ordens de serviço do back-end.
        const data = await workOrderService.getAll();
        // Se o usuário não saiu da tela enquanto a requisição rodava, atualiza os dados.
        if (isMounted) {
          setWorkOrders(data);
        }
      } catch (err: unknown) {
        // Se o componente continuar montado, atualiza o estado com a mensagem de erro.
        if (isMounted) {
          setError(getErrorMessage(err, "Erro ao carregar Ordens de Serviço."));
        }
      } finally {
        // Se o componente continuar montado, desliga o estado de carregamento inicial.
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Executa a função de carga que foi declarada logo acima.
    loadData();

    // Função de limpeza (cleanup) executada automaticamente se o componente for desmontado da tela.
    return () => {
      // Altera a flag para falso, cancelando atualizações de estado pendentes e evitando vazamento de memória (Memory Leak).
      isMounted = false;
    };
  }, []); // Array de dependências vazio garante que o efeito rode apenas no nascimento do componente.

  // Retorna os estados e a função de atualização manual (refetch) para os componentes que consumirem o hook.
  return {
    workOrders,
    loading,
    error,
    refetch: fetchWorkOrders,
  };
}

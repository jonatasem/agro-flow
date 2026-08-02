// Importa os hooks necessários do React para gerenciar estado, efeitos colaterais e memorização de funções.
import { useState, useEffect, useCallback } from "react";

// Importa o serviço que faz as requisições de ordens de serviço e o seu respectivo tipo de dado.
import { workOrderService, type WorkOrder } from "../services/workOrderService";

// Importa a função utilitária para extrair mensagens de erro com segurança.
import { getErrorMessage } from "../../../utility/getErrorMessage";

// Define e exporta a função do hook personalizado que gerencia a listagem de ordens de serviço.
export function useWorkOrders() {
  // Estado que armazena a lista de ordens de serviço retornada pela API.
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  
  // Estado booleano que indica se a aplicação está buscando os dados (inicia como verdadeiro).
  const [loading, setLoading] = useState(true);
  
  // Estado que armazena mensagens de erro em caso de falha nas requisições.
  const [error, setError] = useState("");

  // Memoriza a função de busca usando useCallback para evitar que ela seja recriada a cada renderização da página.
  const fetchWorkOrders = useCallback(async () => {
    try {
      // Ativa o indicador visual de carregamento.
      setLoading(true);
      // Limpa erros residuais antes de iniciar a nova tentativa de busca.
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

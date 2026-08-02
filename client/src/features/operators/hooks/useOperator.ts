// Importa os hooks do React para controle de estados locais, efeitos colaterais e otimização de funções na memória.
import { useState, useEffect, useCallback } from "react";

// Importa a instância pré-configurada do Axios para realizar chamadas HTTP na API.
import { api } from "../../../services/api";

// Importa a função utilitária para tratamento e extração amigável de mensagens de erro.
import { getErrorMessage } from "../../../utility/getErrorMessage";

// Define a estrutura TypeScript para representar um operador retornado pelo banco de dados.
export interface Operator {
  id: string;            // Identificador único do operador.
  name: string;          // Nome completo do profissional.
  registration: string;  // Código de matrícula utilizado no login.
  city?: string;         // Cidade ou base de atuação operacional (opcional).
  createdAt?: string;    // Carimbo de data/hora de criação do registro (opcional).
}

// Define os campos aceitos no momento de cadastrar um novo operador no sistema.
export interface CreateOperatorInput {
  name: string;          // Nome completo obrigatório.
  registration: string;  // Código de matrícula obrigatório.
  city?: string;         // Cidade ou base operacional (opcional).
  password?: string;     // Senha de autenticação inicial (opcional).
}

// Define os campos editáveis de um operador, mapeando todos como opcionais.
export interface UpdateOperatorInput {
  name?: string;
  registration?: string;
  city?: string;
  password?: string;
}

// Exporta o hook customizado que centraliza e gerencia todo o estado e ações de operadores.
export function useOperators() {
  // Estado que armazena o array com a lista completa de operadores cadastrados.
  const [operators, setOperators] = useState<Operator[]>([]);
  
  // Estado booleano para gerenciar a exibição visual de carregamento na tela.
  const [loading, setLoading] = useState(true);
  
  // Estado que armazena mensagens de falha em caso de erros de rede ou requisição.
  const [error, setError] = useState("");

  // Memoriza a função de atualização manual com useCallback para evitar recriações desnecessárias a cada re-render.
  const fetchOperators = useCallback(async () => {
    try {
      setLoading(true); // Liga o indicador visual de processamento.
      setError("");     // Limpa rastros de erros anteriores.
      // Faz uma requisição HTTP GET para coletar os operadores cadastrados na API.
      const response = await api.get<Operator[]>("/operator");
      setOperators(response.data); // Sincroniza a resposta no estado local de operadores.
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar operadores.")); // Captura e trata erros.
    } finally {
      setLoading(false); // Desliga o indicador visual de carregamento.
    }
  }, []); // Dependências vazias mantêm a mesma referência de função durante todo o ciclo de vida.

  // Executa automaticamente a carga inicial de dados assim que o componente que consome o hook é montado.
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

  // Método assíncrono interno para realizar o envio e a criação de um novo operador.
  const createOperator = async (payload: CreateOperatorInput) => {
    try {
      // Dispara a requisição POST repassando o payload de inputs da tela.
      const response = await api.post<Operator>("/operator", payload);
      // Otimização de Interface (Imutabilidade): adiciona o novo operador diretamente no final do array existente.
      setOperators((prev) => [...prev, response.data]);
      return response.data; // Retorna o objeto criado com o ID gerado pelo back-end.
    } catch (err: unknown) {
      // Embrulha o erro de forma nativa e o repassa para tratamento no componente visual.
      throw new Error(getErrorMessage(err, "Erro ao criar operador."), { cause: err });
    }
  };

  // Método assíncrono para atualizar atributos cadastrais de um operador existente.
  const updateOperator = async (id: string, payload: UpdateOperatorInput) => {
    try {
      // Executa uma requisição PUT injetando o ID na rota correspondente.
      const response = await api.put<Operator>(`/operator/${id}`, payload);
      // Mapeia e altera exclusivamente o item editado dentro do array local usando correspondência de IDs.
      setOperators((prev) => prev.map((item) => (item.id === id ? response.data : item)));
      return response.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar operador."), { cause: err });
    }
  };

  // Método assíncrono para deletar permanentemente um operador através de seu identificador.
  const deleteOperator = async (id: string) => {
    try {
      // Executa a requisição DELETE direta para a rota identificada na API.
      await api.delete(`/operator/${id}`);
      // Remove instantaneamente o operador deletado do array local filtrando pelo ID.
      setOperators((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao remover operador."), { cause: err });
    }
  };

  // Retorna os estados locais e todos os métodos de gerenciamento do CRUD para os componentes.
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

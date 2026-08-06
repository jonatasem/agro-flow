// Importa os hooks do React para gerenciar estados locais, ciclo de vida e otimizar referências de funções.
import { useState, useEffect, useCallback } from "react";

// Importa a instância global do Axios configurada com a URL base e os interceptores de token.
import { api } from "../services/api"

// Importa a função utilitária para extrair mensagens de erro da API de forma segura.
import { getErrorMessage } from "../utility/getErrorMessage";

// Define a estrutura de dados para representar um Equipamento retornado pelo back-end.
export interface Equipment {
  id: string;          // Identificador único universal do equipamento.
  fleet: string;       // Código de prefixo ou número de identificação da frota.
  name: string;        // Nome ou modelo descritivo do maquinário.
  createdAt?: string;  // Carimbo opcional contendo a data/hora de criação do registro.
}

// Define os campos obrigatórios necessários para cadastrar um novo equipamento.
export interface CreateEquipmentInput {
  fleet: string;       // Prefixo da frota.
  name: string;        // Nome do equipamento.
}

// Define os campos aceitos para atualização, configurando todos como opcionais.
export interface UpdateEquipmentInput {
  fleet?: string;
  name?: string;
}

// Exporta o hook customizado que encapsula o estado e as operações do CRUD de frotas agrícolas.
export function useEquipments() {
  // Estado que armazena a lista com todos os equipamentos/frotas carregados da API.
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  
  // Estado booleano que monitora o processamento visual de carregamento na tela.
  const [loading, setLoading] = useState(true);
  
  // Estado que armazena strings de mensagens em caso de falhas nas requisições HTTP.
  const [error, setError] = useState("");

  // 1. READ ALL - Memoriza a função de busca manual para evitar re-renderizações infinitas no componente pai.
  const fetchEquipments = useCallback(async () => {
    try {
      setLoading(true); // Liga o indicador visual de processamento de dados.
      setError("");     // Limpa rastros de alertas e erros antigos da interface.
      // Faz uma chamada HTTP GET apontando diretamente para a rota de equipamentos.
      const response = await api.get<Equipment[]>("/equipment");
      setEquipments(response.data); // Sincroniza o array de dados puros recebidos no estado local.
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar equipamentos.")); // Trata e expõe o erro.
    } finally {
      setLoading(false); // Garante o desligamento do carregador visual após o encerramento.
    }
  }, []); // Dependências vazias mantêm a mesma instância de função durante o ciclo de vida do app.

  // Carga inicial automática acionada no nascimento (montagem) do componente na tela.
  useEffect(() => {
    // Flag de segurança para evitar que o React atualize o estado caso o usuário mude de tela no meio da requisição (Memory Leak).
    let isMounted = true;

    async function loadData() {
      try {
        setError("");
        const response = await api.get<Equipment[]>("/equipment");
        // Se o componente de tela ainda continuar ativo e montado, persiste os dados no estado.
        if (isMounted) {
          setEquipments(response.data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(getErrorMessage(err, "Erro ao carregar equipamentos."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData(); // Executa o método assíncrono interno declarativo.

    // Função de limpeza (cleanup) disparada no momento em que o componente sai de tela (desmontagem).
    return () => {
      isMounted = false; // Bloqueia qualquer tentativa tardia de alteração de estados pendentes da API.
    };
  }, []); // Array de dependências vazio garante execução restrita a uma única vez na inicialização.

  // 2. CREATE - Método assíncrono para enviar inputs e criar um novo equipamento.
  const createEquipment = async (payload: CreateEquipmentInput) => {
    try {
      // Faz a chamada HTTP POST injetando o payload estruturado contendo frota e nome.
      const response = await api.post<Equipment>("/equipment", payload);
      // Atualização Otimista / Imutabilidade: acopla o novo registro gerado diretamente no final do array existente.
      setEquipments((prev) => [...prev, response.data]);
      return response.data; // Retorna o objeto completo integrado com o seu novo ID.
    } catch (err: unknown) {
      // Embrulha o erro de rede e o repassa com uma mensagem limpa para tratamento no componente visual.
      throw new Error(getErrorMessage(err, "Erro ao criar equipamento."), { cause: err });
    }
  };

  // 3. UPDATE - Método assíncrono para alterar dados cadastrais de um equipamento existente.
  const updateEquipment = async (id: string, payload: UpdateEquipmentInput) => {
    try {
      // Executa a chamada HTTP PUT passando as propriedades modificadas para a rota correspondente do ID.
      const response = await api.put<Equipment>(`/equipment/${id}`, payload);
      // Vasculha o array existente substituindo unicamente o item modificado por meio da equivalência de IDs.
      setEquipments((prev) => prev.map((item) => (item.id === id ? response.data : item)));
      return response.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar equipamento."), { cause: err });
    }
  };

  // 4. DELETE - Método assíncrono para remover permanentemente um maquinário por meio do identificador único.
  const deleteEquipment = async (id: string) => {
    try {
      // Realiza a chamada HTTP DELETE direta apontando para o endpoint indexado.
      await api.delete(`/equipment/${id}`);
      // Remove de forma instantânea o equipamento excluído filtrando o array local e mantendo apenas os IDs diferentes.
      setEquipments((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao remover equipamento."), { cause: err });
    }
  };

  // Retorna os estados reativos e todos os manipuladores do CRUD unificados para consumo nos componentes.
  return {
    equipments,
    loading,
    error,
    refetch: fetchEquipments,
    createEquipment,
    updateEquipment,
    deleteEquipment,
  };
}

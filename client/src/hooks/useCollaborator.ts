// Importa os hooks do React para gerenciar estados locais, ciclo de vida e memorização de funções.
import { useState, useEffect, useCallback } from "react";

// Importa os serviços assíncronos e as respectivas interfaces de tipo para controle de colaboradores.
import {
  collaboratorService,
  type Collaborator,
  type CreateCollaboratorInput,
  type UpdateCollaboratorInput,
} from "../services/collaboratorService";

// Importa a função utilitária segura para tratar e extrair mensagens de erro vindas do servidor.
import { getErrorMessage } from "../utility/getErrorMessage";

// Exporta o hook customizado responsável por gerenciar a lógica e os dados da listagem de colaboradores.
export function useCollaborator() {
  // Estado local que armazena o array com a lista completa de colaboradores ativos e cadastrados.
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  
  // Estado booleano que sinaliza e monitora a exibição visual de carregamento na tela.
  const [loading, setLoading] = useState(true);
  
  // Estado textual que armazena mensagens de erro em caso de falhas de comunicação ou rede.
  const [error, setError] = useState("");

  // Com refetch para o botão manual: Memoriza a função de busca com useCallback para evitar re-renderizações infinitas.
  const fetchCollaborators = useCallback(async () => {
    try {
      setLoading(true); // Liga o indicador visual de processamento de dados.
      setError("");     // Limpa rastros de alertas ou erros antigos da interface do usuário.
      // Faz uma requisição assíncrona chamando o serviço HTTP GET para obter a lista de colaboradores.
      const data = await collaboratorService.getAll();
      setCollaborators(data); // Sincroniza o array de dados puros recebidos no estado local.
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao carregar colaboradores.")); // Captura e trata o erro adequadamente.
    } finally {
      setLoading(false); // Garante o desligamento do indicador visual de carregamento após o encerramento.
    }
  }, []); // Array de dependências vazio mantém a mesma instância de referência em memória durante todo o ciclo.

  // Carregamento inicial automático acionado assim que o componente que consome este hook nasce na tela.
  useEffect(() => {
    // Flag de controle para evitar a atualização de estados em componentes desativados do DOM (Evita vazamento de memória).
    let isMounted = true;

    async function loadData() {
      try {
        setError("");
        const data = await collaboratorService.getAll();
        // Se a tela atual continuar montada e ativa ao término da requisição HTTP, persiste os dados.
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

    loadData(); // Dispara o método interno assíncrono.

    // Função de limpeza (cleanup) executada de forma automática quando a tela é desmontada.
    return () => {
      isMounted = false; // Altera a flag inviabilizando tentativas de alterações tardias vindo da API.
    };
  }, []); // Array de dependências vazio garante disparo único na inicialização do componente.

  // CREATE - Método assíncrono encarregado de repassar os inputs e registrar um novo colaborador.
  const createCollaborator = async (payload: CreateCollaboratorInput) => {
    try {
      // Executa a chamada HTTP POST através do serviço enviando os dados informados.
      const newItem = await collaboratorService.create(payload);
      // Atualização Otimista / Imutabilidade: acopla o novo objeto gerado diretamente no final do array existente.
      setCollaborators((prev) => [...prev, newItem]);
      return newItem; // Retorna o objeto criado integrado com seu novo ID gerado pelo back-end.
    } catch (err: unknown) {
      // Embrulha o erro de forma nativa e o repassa com uma mensagem limpa para tratamento no formulário.
      throw new Error(getErrorMessage(err, "Erro ao criar colaborador."), { cause: err });
    }
  };

  // UPDATE - Método assíncrono para modificar atributos cadastrais de um colaborador existente.
  const updateCollaborator = async (id: string, payload: UpdateCollaboratorInput) => {
    try {
      // Executa a chamada HTTP PUT enviando as propriedades modificadas para a rota do ID.
      const updatedItem = await collaboratorService.update(id, payload);
      // Varre o array reativo local substituindo unicamente o item modificado por meio da correspondência de IDs.
      setCollaborators((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
      return updatedItem;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao atualizar colaborador."), { cause: err });
    }
  };

  // DELETE - Método assíncrono para remover permanentemente um funcionário por meio de seu ID único.
  const deleteCollaborator = async (id: string) => {
    try {
      // Realiza a chamada HTTP DELETE direta apontada para o endpoint indexado pelo ID.
      await collaboratorService.delete(id);
      // Remove instantaneamente o item excluído filtrando o array local e mantendo apenas os IDs diferentes.
      setCollaborators((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Erro ao remover colaborador."), { cause: err });
    }
  };

  // Retorna os estados locais e todas as operações do CRUD unificadas para consumo nos componentes visuais.
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

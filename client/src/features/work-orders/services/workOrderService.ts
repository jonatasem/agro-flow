// Importa a instância customizada do Axios configurada previamente com a URL base e os tokens.
import { api } from "../../../services/api";

// Importa a tipagem de Colaborador do seu respectivo módulo de serviço.
import { type Collaborator } from "../../collaborators/services/collaboratorService";

// Importa a tipagem de Equipamento do hook de gerenciamento de equipamentos.
import { type Equipment } from "../../equipments/hooks/useEquipment";

// Define a estrutura de dados para os serviços vinculados a um setor específico na Ordem de Serviço.
export interface SectorService {
  id: string;                          // Identificador único do serviço do setor.
  workOrderId: string;                 // ID de vínculo com a Ordem de Serviço pai.
  setor: string;                       // Nome ou identificação do setor afetado.
  // Enumeração estrita de strings para representar o estado atual da manutenção no setor.
  status: "AGUARDANDO_MANUTENCAO" | "EM_MANUTENCAO" | "FINALIZADO" | "CONCLUIDO";
  qruDescricao: string;                // Descrição do problema ou ocorrência (termo de rádio QRU).
  solucaoTecnico?: string;             // Texto opcional detalhando a solução aplicada pelo técnico.
  tipoCausa?: string | null;           // Causa identificada do problema (pode ser nula ou omitida).
  qth: string;                         // Localização física da ocorrência (termo de rádio QTH).
  city: string;                        // Cidade onde o equipamento está ou onde ocorreu a falha.
  criadoPorId: string;                 // ID do usuário/colaborador que registrou o chamado.
  tecnicoResponsavelId?: string | null; // ID opcional do técnico encarregado de resolver a falha.
  dataCriacao?: string;                // Data e hora em formato ISO de quando o registro foi feito.
  dataInicioManutencao?: string | null; // Data e hora de início dos trabalhos técnicos.
  dataFimManutencao?: string | null;   // Data e hora de conclusão dos reparos no setor.
  tempoManutencao?: number | null;     // Tempo gasto em minutos ou horas para concluir o serviço.
  criador?: Collaborator;              // Objeto completo com dados do colaborador que criou a OS.
  tecnicoResponsavel?: Collaborator | null; // Objeto completo com os dados do técnico responsável.
}

// Define a estrutura principal de uma Ordem de Serviço (Work Order).
export interface WorkOrder {
  id: string;                          // Identificador único da Ordem de Serviço.
  equipmentId: string;                 // ID do maquinário ou veículo associado.
  operatorId?: string | null;          // ID opcional do operador encarregado do maquinário.
  // Enumeração estrita representando o status geral da Ordem de Serviço.
  status: "ABERTA" | "EM_ANDAMENTO" | "FINALIZADA";
  createdAt?: string;                  // Carimbo de data/hora de criação do registro.
  updatedAt?: string;                  // Carimbo de data/hora da última modificação.
  equipment?: Equipment;               // Objeto contendo os dados estruturados do equipamento.
  operator?: Collaborator | null;      // Objeto contendo os dados estruturados do operador.
  setores: SectorService[];            // Lista contendo os setores e serviços atrelados a esta OS.
}

// Define os campos obrigatórios e opcionais necessários para criar uma nova Ordem de Serviço.
export interface CreateWorkOrderInput {
  fleet: string;                       // Identificador ou prefixo da frota/veículo (ex: trator, caminhão).
  setor: string;                       // Setor inicial onde o chamado está sendo aberto.
  qruDescricao: string;                // Descrição inicial do defeito ou problema reportado.
  qth: string;                         // Localização de origem do chamado.
  city: string;                        // Cidade de atuação.
  operatorId?: string;                 // ID opcional do operador que reportou ou trabalha no equipamento.
}

// Define a estrutura para atualizações, transformando todas as propriedades em opcionais (Partial).
export type UpdateWorkOrderInput = Partial<{
  status: "ABERTA" | "EM_ANDAMENTO" | "FINALIZADA";
  operatorId?: string;
  equipmentId?: string;
  fleet?: string;
  setor?: string;
  qruDescricao?: string;
  qth?: string;
  city?: string;
}>;

// Objeto que agrupa as chamadas HTTP assíncronas para manipulação das Ordens de Serviço no back-end.
export const workOrderService = {

  // Método assíncrono para buscar todas as Ordens de Serviço cadastradas.
  getAll: async (): Promise<WorkOrder[]> => {
    const response = await api.get<WorkOrder[]>("/work-order");
    return response.data;
  },

  // Método assíncrono para buscar uma única Ordem de Serviço por meio do seu ID único.
  getById: async (id: string): Promise<WorkOrder> => {
    const response = await api.get<WorkOrder>(`/work-order/${id}`);
    return response.data;
  },

  // Método assíncrono para enviar dados e registrar uma nova Ordem de Serviço.
  create: async (payload: CreateWorkOrderInput): Promise<WorkOrder> => {
    const response = await api.post<WorkOrder>("/work-order", payload);
    return response.data;
  },

  // Método assíncrono para modificar atributos de uma Ordem de Serviço existente.
  update: async (id: string, payload: UpdateWorkOrderInput): Promise<WorkOrder> => {
    const response = await api.put<WorkOrder>(`/work-order/${id}`, payload);
    return response.data;
  },

  // Método assíncrono para deletar/remover de forma permanente uma OS da base de dados.
  delete: async (id: string): Promise<void> => {
    await api.delete(`/work-order/${id}`);
  },

  // 🚀 NOVO: Método assíncrono para disparar o início do atendimento de um setor específico.
  startSector: async (sectorServiceId: string): Promise<SectorService> => {
    // Faz a chamada HTTP PATCH ou POST correspondente à rota paramétrica do Fastify.
    const response = await api.patch<SectorService>(`/sector/start/${sectorServiceId}`);
    return response.data;
  },

  // 🚀 NOVO: Método assíncrono para registrar a conclusão do reparo técnico de um setor.
  finishSector: async (
    sectorServiceId: string, 
    payload: { solucaoTecnico: string; tipoCausa?: string }
  ): Promise<SectorService> => {
    // Transmite a solução técnica e o tipo de causa no corpo (body) da requisição.
    const response = await api.patch<SectorService>(`/sector/finish/${sectorServiceId}`, payload);
    return response.data;
  }
};

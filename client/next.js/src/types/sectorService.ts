
import type { Collaborator } from "./collaborator";
import type { Equipment } from "./equipment";

// Informações do operador vinculado ao setor
export interface SectorOperator {
  id: string;
  name: string;
  registration: string;
  city: string;
}

// Estrutura detalhada de um setor dentro da Ordem de Serviço
export interface SectorService {
  id: string;
  workOrderId: string;
  setor: string;
  status: "AGUARDANDO_MANUTENCAO" | "EM_MANUTENCAO" | "PAUSADO" | "FINALIZADO";
  qruDescricao: string;
  solucaoTecnico?: string;
  tipoCausa?: string | null;
  motivoPausa?: string | null;
  qth: string;
  city: string;
  criadoPorId: string;
  tecnicoResponsavelId?: string | null;
  dataCriacao: string;
  dataInicioManutencao?: string | null;
  dataFimManutencao?: string | null;
  tempoManutencao?: number | null;
  operator: SectorOperator;
  criador: Collaborator;
  tecnicoResponsavel?: Collaborator | null;
  pauses?: unknown[];
}

// Estrutura principal da Ordem de Serviço (OS)
export interface WorkOrder {
  id: string;
  equipmentId: string;
  operatorId: string;
  status: "ABERTA" | "EM_ANDAMENTO" | "FINALIZADA";
  createdAt: string;
  updatedAt?: string;
  equipment: Equipment;
  operator?: Collaborator;
  setores: SectorService[];
}

// Dados necessários para criar uma nova Ordem de Serviço
export interface CreateWorkOrderInput {
  fleet: string;
  operatorId: string;
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
}

// Campos permitidos na atualização de um setor
export type UpdateSectorInput = Partial<{
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
  solucaoTecnico: string;
  tipoCausa: string;
  status: string;
}>;
import type { Collaborator } from "./collaborator";
import type { Equipment } from "./equipment";

export const SETORES = [
  "Agricultura de Precisão",
  "Mecânica",
  "Elétrica",
  "Hidráulica",
  "Geral",
] as const;

export type Setor = (typeof SETORES)[number];

export const CITIES = [
  "Lucélia - SP",
  "Adamantina - SP",
  "Salmourão - SP",
  "Dracena - SP",
] as const;

export type City = (typeof CITIES)[number];

export type SectorStatus =
  | "AGUARDANDO_MANUTENCAO"
  | "EM_MANUTENCAO"
  | "PAUSADO"
  | "FINALIZADO";

export type WorkOrderStatus = "ABERTA" | "EM_ANDAMENTO" | "FINALIZADA";

export interface SectorOperator {
  id: string;
  name: string;
  registration: string;
  city: string;
}

export interface SectorService {
  id: string;
  workOrderId: string;
  setor: string;
  status: SectorStatus;
  qruDescricao: string;
  solucaoTecnico?: string | null;
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
  operator?: SectorOperator | null;
  criador?: Collaborator;
  tecnicoResponsavel?: Collaborator | null;
}

export interface WorkOrder {
  id: string;
  equipmentId: string;
  operatorId?: string;
  status: WorkOrderStatus;
  createdAt: string;
  updatedAt?: string;
  equipment: Equipment;
  operator?: SectorOperator | Collaborator | null;
  setores: SectorService[];
}

export interface CreateSectorInput {
  setor: string;
  qth: string;
  city: string;
  operatorId?: string;
  qruDescricao: string;
}

export interface CreateWorkOrderInput {
  equipmentId: string;
  setores: CreateSectorInput[];
}

export type UpdateSectorInput = Partial<{
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
  operatorId: string;
  motivoPausa: string;
  solucaoTecnico: string;
  tipoCausa: string;
  status: SectorStatus;
}>;
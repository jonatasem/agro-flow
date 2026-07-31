import { api } from "./api";

// 1. Tipagem dos colaboradores (Criador, Técnico, Operador)
export interface CollaboratorInfo {
  id: string;
  name: string;
  role: string;
  registration?: string;
  city?: string;
  status?: boolean;
}

// 2. Tipagem detalhada dos Setores / Apontamentos da O.S.
export interface SectorService {
  id: string;
  workOrderId: string;
  setor: string;
  status: "AGUARDANDO_MANUTENCAO" | "EM_MANUTENCAO" | "FINALIZADO" | "CONCLUIDO";
  qruDescricao: string;
  solucaoTecnico?: string;
  tipoCausa?: string | null;
  qth: string;
  city: string;
  criadoPorId: string;
  tecnicoResponsavelId?: string | null;
  dataCriacao?: string;
  dataInicioManutencao?: string | null;
  dataFimManutencao?: string | null;
  tempoManutencao?: number | null; // Em minutos
  criador?: CollaboratorInfo;
  tecnicoResponsavel?: CollaboratorInfo | null;
}

// 3. Tipagem de Equipamento (Tratores, Colhedoras, etc.)
export interface EquipmentInfo {
  id: string;
  name: string;
  fleet: string;
  createdAt?: string;
  updatedAt?: string;
}

// 4. Tipagem principal da Ordem de Serviço
export interface WorkOrder {
  id: string;
  equipmentId: string;
  operatorId?: string | null;
  status: "ABERTA" | "EM_ANDAMENTO" | "FINALIZADA";
  createdAt?: string;
  updatedAt?: string;
  equipment?: EquipmentInfo;
  operator?: CollaboratorInfo | null;
  setores: SectorService[];
}

// 5. Payload para criar nova O.S.
export interface CreateWorkOrderInput {
  fleet: string;
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
}

// -------------------------------------------------------------
// FUNÇÕES DE INTEGRAÇÃO COM O BACKEND (API)
// -------------------------------------------------------------

// Listar todas as Ordens de Serviço
export async function getWorkOrders(): Promise<WorkOrder[]> {
  const response = await api.get<WorkOrder[]>("/work-order");
  return response.data;
}

// Criar nova O.S. (Líder Agrícola / COA / Operador)
export async function createWorkOrder(data: CreateWorkOrderInput) {
  const response = await api.post("/work-order", data);
  return response.data;
}

// Excluir O.S. por ID (Restrito para COA no Backend)
export async function deleteWorkOrder(id: string): Promise<void> {
  await api.delete(`/work-order/${id}`);
}

// Listar equipamentos cadastrados
export async function getEquipments(): Promise<EquipmentInfo[]> {
  const response = await api.get<EquipmentInfo[]>("/equipment");
  return response.data;
}

// Listar colaboradores (Técnicos, Líderes)
export async function getCollaborators(): Promise<CollaboratorInfo[]> {
  const response = await api.get<CollaboratorInfo[]>("/collaborator");
  return response.data;
}


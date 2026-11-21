import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export interface SectorPayload {
  setor: string;
  qth: string;
  city: string;
  operatorId?: string;
  qruDescricao: string;
}

export interface CreateWorkOrderProps {
  equipmentId: string;
  setores: SectorPayload[];
  criadoPor: string;
  userRole: string;
}

const WORK_ORDER_INCLUDE = {
  equipment: true,
  setores: {
    include: {
      operator: true,
      criador: { select: { id: true, name: true, role: true } },
      tecnicoResponsavel: { select: { id: true, name: true, role: true } },
    },
  },
} as const;

export class CreateWorkOrderService {
  async execute({
    equipmentId,
    setores,
    criadoPor,
    userRole,
  }: CreateWorkOrderProps) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para abrir ordens de serviço.",
      );
    }

    const creator = await prismaClient.collaborator.findUnique({
      where: { id: criadoPor },
    });
    if (!creator) {
      throw new Error("Usuário criador não encontrado.");
    }

    const equipment = await prismaClient.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!equipment) {
      throw new Error("Equipamento não encontrado.");
    }

    // Valida ou resolve operadores (aceita ID do banco ou matrícula)
    const resolvedOperatorIds: string[] = [];
    for (const item of setores) {
      if (!item.operatorId) {
        throw new Error(
          "Selecione um operador para o setor (o banco exige operador vinculado).",
        );
      }

      const operator =
        (await prismaClient.operator.findUnique({
          where: { id: item.operatorId },
        })) ??
        (await prismaClient.operator.findUnique({
          where: { registration: item.operatorId },
        }));

      if (!operator) {
        throw new Error(
          `Operador não encontrado para o identificador "${item.operatorId}".`,
        );
      }

      resolvedOperatorIds.push(operator.id);
    }

    const activeWorkOrder = await prismaClient.workOrder.findFirst({
      where: {
        equipmentId: equipment.id,
        status: "ABERTA",
      },
    });

    const sectorsToCreate = setores.map((item, idx) => ({
      operatorId: resolvedOperatorIds[idx]!,
      setor: item.setor.trim(),
      qruDescricao: item.qruDescricao.trim(),
      qth: item.qth.trim(),
      city: item.city.trim(),
      criadoPorId: criadoPor,
      status: "AGUARDANDO_MANUTENCAO",
    }));

    if (activeWorkOrder) {
      await prismaClient.sectorService.createMany({
        data: sectorsToCreate.map((s) => ({
          ...s,
          workOrderId: activeWorkOrder.id,
        })),
      });

      const updated = await prismaClient.workOrder.findUnique({
        where: { id: activeWorkOrder.id },
        include: WORK_ORDER_INCLUDE,
      });

      if (!updated) {
        throw new Error("Ordem de Serviço não encontrada após atualização.");
      }

      return updated;
    }

    return prismaClient.workOrder.create({
      data: {
        equipmentId: equipment.id,
        status: "ABERTA",
        setores: {
          create: sectorsToCreate,
        },
      },
      include: WORK_ORDER_INCLUDE,
    });
  }
}
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

interface CreateWorkOrderProps {
  fleet: string;
  operatorRegistration: string;
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
  criadoPor: string;
  userRole: string;
}

export class CreateWorkOrderService {
  async execute({
    fleet,
    operatorRegistration,
    setor,
    qruDescricao,
    qth,
    city,
    criadoPor,
    userRole,
  }: CreateWorkOrderProps) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para abrir ordens de serviço.",
      );
    }

    const collaboratorExists = await prismaClient.collaborator.findUnique({
      where: { id: criadoPor },
    });

    if (!collaboratorExists) {
      throw new Error("Usuário criador não encontrado.");
    }

    const equipment = await prismaClient.equipment.findUnique({
      where: { fleet },
    });

    if (!equipment) {
      throw new Error("Equipamento não encontrado.");
    }

    // Busca o operador pela matrícula
    const operatorExists = await prismaClient.operator.findUnique({
      where: { registration: operatorRegistration },
    });

    if (!operatorExists) {
      throw new Error("Operador não encontrado com a matrícula informada.");
    }

    // Se existir O.S. aberta com a mesma frota do equipamento
    const activeWorkOrder = await prismaClient.workOrder.findFirst({
      where: {
        equipmentId: equipment.id,
        status: "ABERTA",
      },
    });

    // Vincula o setor/operador diretamente à O.S. já aberta
    if (activeWorkOrder) {
      await prismaClient.sectorService.create({
        data: {
          workOrderId: activeWorkOrder.id,
          operatorId: operatorExists.id,
          setor,
          qruDescricao,
          qth,
          city,
          criadoPorId: criadoPor,
          status: "AGUARDANDO_MANUTENCAO",
        },
      });

      return await prismaClient.workOrder.findUnique({
        where: { id: activeWorkOrder.id },
        include: {
          equipment: true,
          setores: {
            include: {
              operator: true,
              criador: {
                select: { id: true, name: true, role: true },
              },
              tecnicoResponsavel: {
                select: { id: true, name: true, role: true },
              },
            },
          },
        },
      });
    }

    // Se não existir O.S. aberta, cria uma nova O.S. e insere o primeiro setor
    const newWorkOrder = await prismaClient.workOrder.create({
      data: {
        equipmentId: equipment.id,
        status: "ABERTA",
        setores: {
          create: {
            operatorId: operatorExists.id,
            setor,
            qruDescricao,
            qth,
            city,
            criadoPorId: criadoPor,
            status: "AGUARDANDO_MANUTENCAO",
          },
        },
      },
      include: {
        equipment: true,
        setores: {
          include: {
            operator: true,
            criador: {
              select: { id: true, name: true, role: true },
            },
            tecnicoResponsavel: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    return newWorkOrder;
  }
}

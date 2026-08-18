import prismaClient from "../../prisma/index.js";

interface CreateWorkOrderProps {
  fleet: string;
  operatorId: string;
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
  criadoPor: string;
}

export class CreateWorkOrderService {
  async execute({ fleet, operatorId, setor, qruDescricao, qth, city, criadoPor }: CreateWorkOrderProps) {
    if (!fleet || !operatorId || !setor || !qruDescricao || !qth || !city || !criadoPor) {
      throw new Error("Todos os campos são obrigatórios");
    }

    const collaboratorExists = await prismaClient.collaborator.findUnique({
      where: { id: criadoPor }
    });

    if (!collaboratorExists) {
      throw new Error("Usuário criador não encontrado.");
    }

    const equipment = await prismaClient.equipment.findUnique({
      where: { fleet },
    });

    if (!equipment) {
      throw new Error("Equipamento não encontrado");
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(operatorId);

    const operatorExists = await prismaClient.operator.findFirst({
      where: isObjectId
        ? { id: operatorId }
        : { registration: operatorId }
    });

    if (!operatorExists) {
      throw new Error("Operador não encontrado com esta matrícula/ID.");
    }

    const activeWorkOrder = await prismaClient.workOrder.findFirst({
      where: {
        equipmentId: equipment.id,
        status: "ABERTA",
      },
    });

    // Se existir O.S. aberta, vincula o operador diretamente ao novo setor
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

    // Se não existir O.S. aberta, cria a O.S. sem operatorId e insere no setor
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
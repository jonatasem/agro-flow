import prismaClient from "../../prisma/index.js";

interface CreateWorkOrderProps {
  fleet: string;
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
  criadoPor: string;
}

export class CreateWorkOrderService {
  async execute({
    fleet,
    setor,
    qruDescricao,
    qth,
    city,
    criadoPor,
  }: CreateWorkOrderProps) {
    if (!fleet || !setor || !qruDescricao || !qth || !city || !criadoPor) {
      throw new Error("Todos os campos são obrigatórios");
    }

    const equipment = await prismaClient.equipment.findUnique({
      where: { fleet },
    });

    if (!equipment) {
      throw new Error("Equipamento não encontrado");
    }

    const activeWorkOrder = await prismaClient.workOrder.findFirst({
      where: {
        equipmentId: equipment.id,
        status: "ABERTA",
      },
    });

    if (activeWorkOrder) {
      const newSectorService = await prismaClient.sectorService.create({
        data: {
          workOrderId: activeWorkOrder.id,
          setor,
          qruDescricao,
          qth,
          city,
          criadoPor,
          status: "Aguardando Manutenção",
        },
      });
      return newSectorService;
    }

    const newWorkOrder = await prismaClient.workOrder.create({
      data: {
        equipmentId: equipment.id,
        status: "ABERTA",
        setores: {
          create: {
            setor,
            qruDescricao,
            qth,
            city,
            criadoPor,
            status: "Aguardando Manutenção",
          },
        },
      },
      include: {
        setores: true,
      },
    });

    return newWorkOrder;
  }
}

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
  async execute({ fleet, setor, qruDescricao, qth, city, criadoPor }: CreateWorkOrderProps) {
    if (!fleet || !setor || !qruDescricao || !qth || !city || !criadoPor) {
      throw new Error("Todos os campos são obrigatórios");
    }

    const collaboratorExists = await prismaClient.collaborator.findUnique({
      where: { id: criadoPor }
    })

    if(!collaboratorExists){
      throw new Error("Usuário criador não encontrado.")
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

    // Se existir O.S. aberta, cadastra o novo setor dentro dela
    if (activeWorkOrder) {
      await prismaClient.sectorService.create({
        data: {
          workOrderId: activeWorkOrder.id,
          setor,
          qruDescricao,
          qth,
          city,
          criadoPorId: criadoPor,
          status: "AGUARDANDO_MANUTENCAO",
        },
      });

      // Retorna a O.S. completa atualizada
      return await prismaClient.workOrder.findUnique({
        where: { id: activeWorkOrder.id },
        include: {
          equipment: true,
          operator: true,
          setores: {
            include: {
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

    // Se não existir O.S. aberta, cria uma nova
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
            criadoPorId: criadoPor,
            status: "AGUARDANDO_MANUTENCAO",
          },
        },
      },
      include: {
        equipment: true,
        operator: true,
        setores: {
          include: {
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


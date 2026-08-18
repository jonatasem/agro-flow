import prismaClient from "../../prisma/index.js";

interface GetWorkOrderByIdProps {
  workOrderId: string;
}

export class GetWorkOrderByIdService {
  async execute({ workOrderId }: GetWorkOrderByIdProps) {
    if (!workOrderId) {
      throw new Error("ID da Ordem de Serviço é obrigatório.");
    }

    const workOrder = await prismaClient.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        equipment: true,
        setores: {
          include: {
            operator: true,
            criador: { select: { id: true, name: true, role: true } },
            tecnicoResponsavel: { select: { id: true, name: true, role: true } },
            pauses: true,
          },
        },
      },
    });

    if (!workOrder) {
      throw new Error("Ordem de Serviço não encontrada.");
    }

    return workOrder;
  }
}
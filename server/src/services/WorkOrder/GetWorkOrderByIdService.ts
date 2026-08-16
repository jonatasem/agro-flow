import prismaClient from "../../prisma/index.js";

export class GetWorkOrderByIdService {
  async execute(workOrderId: string) {
    if (!workOrderId) throw new Error("ID da Ordem de Serviço é obrigatório.");

    const workOrder = await prismaClient.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        equipment: true,
        operator: true,
        setores: {
          include: {
            criador: { select: { id: true, name: true, role: true } },
            tecnicoResponsavel: { select: { id: true, name: true, role: true } },
            pauses: true,
            usedParts: { include: { part: true } },
            usedTools: { include: { tool: true } },
          },
        },
      },
    });

    if (!workOrder) throw new Error("Ordem de Serviço não encontrada.");

    return workOrder;
  }
}
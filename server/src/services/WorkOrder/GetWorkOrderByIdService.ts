import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

interface GetWorkOrderByIdProps {
  workOrderId: string;
  userRole: string;
}

export class GetWorkOrderByIdService {
  async execute({ workOrderId, userRole }: GetWorkOrderByIdProps) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores.",
      );
    }
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
            tecnicoResponsavel: {
              select: { id: true, name: true, role: true },
            },
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

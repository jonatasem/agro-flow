import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

interface DeleteSectorProps {
  id: string;
  userRole: string;
}

export class DeleteSectorService {
  async execute({ id, userRole }: DeleteSectorProps) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para excluir setores da ordem de serviço.",
      );
    }

    // Busca o setor pelo ID informado
    const sectorExists = await prismaClient.sectorService.findUnique({
      where: { id },
      select: {
        id: true,
        workOrderId: true,
      },
    });

    if (!sectorExists) {
      throw new Error("Setor da ordem de serviço não encontrado.");
    }

    // 2. Conta quantos setores pertencem a esta mesma Ordem de Serviço
    const totalSectorsInWorkOrder = await prismaClient.sectorService.count({
      where: {
        workOrderId: sectorExists.workOrderId,
      },
    });

    // Se for o único setor, remove a Ordem de Serviço inteira (que remove o setor via Cascade)
    if (totalSectorsInWorkOrder <= 1) {
      await prismaClient.workOrder.delete({
        where: { id: sectorExists.workOrderId },
      });

      return {
        message: "Ordem de serviço e seu único setor foi excluído com sucesso.",
        deletedWorkOrder: true,
      };
    }

    // Se existirem outros setores na OS, exclui apenas o setor selecionado
    const deletedSector = await prismaClient.sectorService.delete({
      where: { id },
    });

    return {
      message: "Setor excluído com sucesso.",
      deletedWorkOrder: false,
      sector: deletedSector,
    };
  }
}
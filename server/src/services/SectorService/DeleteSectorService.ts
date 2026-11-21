// src/services/SectorService/DeleteSectorService.ts
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export class DeleteSectorService {
  async execute({ id, userRole }: { id: string; userRole: string }) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para excluir setores da ordem de serviço.",
      );
    }

    const sector = await prismaClient.sectorService.findUnique({
      where: { id },
      select: { id: true, workOrderId: true },
    });

    if (!sector) {
      throw new Error("Setor da ordem de serviço não encontrado.");
    }

    const totalSectors = await prismaClient.sectorService.count({
      where: { workOrderId: sector.workOrderId },
    });

    if (totalSectors <= 1) {
      await prismaClient.workOrder.delete({ where: { id: sector.workOrderId } });
      return {
        message: "Ordem de serviço e seu único setor excluídos com sucesso.",
        deletedWorkOrder: true,
      };
    }

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
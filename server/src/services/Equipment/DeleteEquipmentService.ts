// src/services/Equipment/DeleteEquipmentService.ts
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export class DeleteEquipmentService {
  async execute({ id, userRole }: { id: string; userRole: string }) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para excluir equipamentos.",
      );
    }

    const existing = await prismaClient.equipment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Equipamento não encontrado.");
    }

    await prismaClient.equipment.delete({ where: { id } });

    return { message: "Equipamento excluído com sucesso." };
  }
}
// src/services/Equipment/UpdateEquipmentService.ts
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export interface UpdateEquipmentProps {
  id: string;
  name?: string | undefined;
  fleet?: string | undefined;
  userRole: string;
}

export class UpdateEquipmentService {
  async execute({ id, name, fleet, userRole }: UpdateEquipmentProps) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para atualizar equipamentos.",
      );
    }

    const existing = await prismaClient.equipment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Equipamento não encontrado.");
    }

    if (fleet && fleet !== existing.fleet) {
      const fleetInUse = await prismaClient.equipment.findUnique({
        where: { fleet },
      });
      if (fleetInUse) {
        throw new Error("Esta frota já está em uso por outro equipamento.");
      }
    }

    const updateData = {
      ...(name !== undefined && { name }),
      ...(fleet !== undefined && { fleet }),
    };

    return prismaClient.equipment.update({
      where: { id },
      data: updateData,
    });
  }
}
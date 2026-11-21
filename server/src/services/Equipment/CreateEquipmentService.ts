// src/services/Equipment/CreateEquipmentService.ts
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export interface CreateEquipmentProps {
  name: string;
  fleet: string;
  userRole: string;
}

export class CreateEquipmentService {
  async execute({ name, fleet, userRole }: CreateEquipmentProps) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar equipamentos.",
      );
    }

    const fleetExists = await prismaClient.equipment.findUnique({
      where: { fleet },
    });

    if (fleetExists) {
      throw new Error("Já existe um equipamento cadastrado com essa frota.");
    }

    return prismaClient.equipment.create({
      data: { name, fleet },
    });
  }
}
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export interface CreateEquipmentProps {
  name: string;
  fleet: string;
  userRole: string;
}

export class CreateEquipmentService {
  async execute({ name, fleet, userRole }: CreateEquipmentProps) {
    // Validação do RBAC
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores.",
      );
    }

    const fleetExists = await prismaClient.equipment.findUnique({
      where: { fleet }
    });
    
    if(fleetExists){
      throw new Error("Já existe um equipamento cadastrado com essa frota.")
    }

    const equipment = await prismaClient.equipment.create({
      data: {
        name,
        fleet,
      },
    });

    return equipment;
  }
}

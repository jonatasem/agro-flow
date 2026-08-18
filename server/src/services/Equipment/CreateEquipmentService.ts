import prismaClient from "../../prisma/index.js";

export interface CreateEquipmentProps {
  name: string;
  fleet: string;
}

export class CreateEquipmentService {
  async execute({ name, fleet }: CreateEquipmentProps) {
    if (!name || !fleet) {
      throw new Error("Todos os campos são obrigatórios.");
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

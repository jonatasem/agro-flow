import prismaClient from "../../prisma/index.js";

export class ListEquipmentService {
  async execute() {

    // Verifica se existe equipamento cadastrado
    const equipment = await prismaClient.equipment.findMany();

     // Retorna todos que encontrar
    return equipment;
  }
}

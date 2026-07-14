import prismaClient from "../../prisma/index.js";

export class ListEquipmentService {
  async execute() {
    const equipment = await prismaClient.equipment.findMany();

    return equipment;
  }
}

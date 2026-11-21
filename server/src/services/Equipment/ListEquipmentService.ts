
import prismaClient from "../../prisma/index.js";

export class ListEquipmentService {
  async execute() {
    return prismaClient.equipment.findMany({
      orderBy: { fleet: "asc" },
    });
  }
}
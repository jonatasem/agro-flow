import prismaClient from "../../prisma/index.js";

interface DeleteEquipmentProps {
  id: string;
}

export class DeleteEquipmentService {
  async execute({id}: DeleteEquipmentProps) {
    if (!id) {
      throw new Error("Id do equipamento não encontrado.");
    }

    const findOfficial = await prismaClient.equipment.findUnique({
      where: { id },
    });

    if (!findOfficial) {
      throw new Error("Equipamento não encontrado");
    }

    await prismaClient.equipment.delete({
      where: { id },
    });

    return { message: "Equipamento deletado com sucesso." };
  }
}

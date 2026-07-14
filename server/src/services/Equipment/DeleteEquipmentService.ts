import prismaClient from "../../prisma/index.js";

interface DeleteEquipmentProps {
  id: string;
}

export class DeleteEquipmentService {
  async execute(id: DeleteEquipmentProps) {
    if (!id) {
      throw new Error("Id do equipamento não encontrado.");
    }

    const findOfficial = await prismaClient.equipment.findFirst({
      where: {
        id: id.id,
      },
    });

    if (!findOfficial) {
      throw new Error("Equipamento não encontrado");
    }

    await prismaClient.equipment.delete({
      where: {
        id: findOfficial.id,
      },
    });

    return { message: "Equipamento deletado com sucesso." };
  }
}

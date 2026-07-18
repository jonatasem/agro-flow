import prismaClient from "../../prisma/index.js";

interface DeleteEquipmentProps {
  id: string;
}

export class DeleteEquipmentService {
  async execute(id: DeleteEquipmentProps) {

    // Verifica se passou o id corretamente
    if (!id) {
      throw new Error("Id do equipamento não encontrado.");
    }

    // Faz a busca do colaborador pelo id
    const findOfficial = await prismaClient.equipment.findFirst({
      where: {
        id: id.id,
      },
    });

    // Se nao encontrar, de um erro
    if (!findOfficial) {
      throw new Error("Equipamento não encontrado");
    }

    // Deleta o equipamento
    await prismaClient.equipment.delete({
      where: {
        id: findOfficial.id,
      },
    });

    // Retorna a mensagem de sucesso
    return { message: "Equipamento deletado com sucesso." };
  }
}

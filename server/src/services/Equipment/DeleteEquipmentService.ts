import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

interface DeleteEquipmentProps {
  id: string;
  userRole: string;
}

export class DeleteEquipmentService {
  async execute({ id, userRole }: DeleteEquipmentProps) {
    // Validação do RBAC
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores.",
      );
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

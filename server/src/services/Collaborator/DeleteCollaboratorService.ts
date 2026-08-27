import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

interface DeleteCollaboratorProps {
  id: string;
  userRole: string;
}

export class DeleteCollaboratorService {
  async execute({ id, userRole }: DeleteCollaboratorProps) {
    // Validação do RBAC
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para deletar colaboradores."
      );
    }
    
    const findCollaborator = await prismaClient.collaborator.findUnique({
      where: { id },
    });

    if (!findCollaborator) {
      throw new Error("Funcionário não encontrado.");
    }

    await prismaClient.collaborator.delete({
      where: { id },
    });

    return { message: "Funcionário deletado com sucesso." };
  }
}
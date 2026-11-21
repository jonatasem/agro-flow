// src/services/Collaborator/DeleteCollaboratorService.ts
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export class DeleteCollaboratorService {
  async execute({ id, userRole }: { id: string; userRole: string }) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para excluir colaboradores.",
      );
    }

    const existing = await prismaClient.collaborator.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Colaborador não encontrado.");
    }

    await prismaClient.collaborator.delete({ where: { id } });

    return { message: "Colaborador excluído com sucesso." };
  }
}
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export interface ListCollaboratorProps {
  userRole: string;
}

export class ListCollaboratorService {
  async execute({ userRole }: ListCollaboratorProps) {
    // Validação do RBAC
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para listar os colaboradores.",
      );
    }

    const result = await prismaClient.collaborator.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        registration: true,
        city: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return result;
  }
}

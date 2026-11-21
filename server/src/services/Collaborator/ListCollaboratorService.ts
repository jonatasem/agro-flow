// src/services/Collaborator/ListCollaboratorService.ts
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export class ListCollaboratorService {
  async execute({ userRole }: { userRole: string }) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para listar colaboradores.",
      );
    }

    return prismaClient.collaborator.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        sector: true,
        registration: true,
        city: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    });
  }
}
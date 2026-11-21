// src/services/Collaborator/UpdateCollaboratorService.ts
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export interface UpdateCollaboratorProps {
  id: string;
  name?: string | undefined;
  role?: string | undefined;
  sector?: string | undefined;
  registration?: string | undefined;
  city?: string | undefined;
  status?: boolean | undefined;
  userRole: string;
}

export class UpdateCollaboratorService {
  async execute({
    id,
    name,
    role,
    sector,
    registration,
    city,
    status,
    userRole,
  }: UpdateCollaboratorProps) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para atualizar colaboradores.",
      );
    }

    const existing = await prismaClient.collaborator.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Colaborador não encontrado.");
    }

    if (registration && registration !== existing.registration) {
      const inUse = await prismaClient.collaborator.findUnique({
        where: { registration },
      });
      if (inUse) {
        throw new Error("Esta matrícula já está em uso por outro colaborador.");
      }
    }

    const updateData = {
      ...(name !== undefined && { name }),
      ...(role !== undefined && { role }),
      ...(sector !== undefined && { sector }),
      ...(registration !== undefined && { registration }),
      ...(city !== undefined && { city }),
      ...(status !== undefined && { status }),
    };

    return prismaClient.collaborator.update({
      where: { id },
      data: updateData,
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
    });
  }
}
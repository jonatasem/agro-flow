import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export interface UpdateCollaboratorProps {
  id: string;
  name?: string | undefined;
  registration?: string | undefined;
  city?: string | undefined;
  status?: boolean | undefined;
  userRole: string;
}

export class UpdateCollaboratorService {
  async execute({ id, userRole, name, registration, city, status }: UpdateCollaboratorProps) {
    // Validação do RBAC
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para atualizar colaboradores."
      );
    }

    const collaboratorExists = await prismaClient.collaborator.findUnique({
      where: { id },
    });

    if (!collaboratorExists) {
      throw new Error("Funcionário não encontrado.");
    }

    // Valida se a nova matrícula já está cadastrada para outro colaborador
    if (registration && registration !== collaboratorExists.registration) {
      const registrationInUse = await prismaClient.collaborator.findUnique({
        where: { registration },
      });

      if (registrationInUse) {
        throw new Error("Esta matrícula já está em uso por outro colaborador.");
      }
    }

    // Omitimos as chaves 'undefined' para respeitar o exactOptionalPropertyTypes
    const updateData = {
      ...(name !== undefined && { name }),
      ...(registration !== undefined && { registration }),
      ...(city !== undefined && { city }),
      ...(status !== undefined && { status }),
    };

    const updatedCollaborator = await prismaClient.collaborator.update({
      where: { id },
      data: updateData,
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

    return updatedCollaborator;
  }
}
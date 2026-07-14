import prismaClient from "../../prisma/index.js";

interface UpdateCollaboratorProps {
  id: string;
  name?: string;
  registration?: string;
  city?: string;
  status?: boolean;
}

export class UpdatecollaboratorService {
  async execute({ id, name, registration, city, status }: UpdateCollaboratorProps) {
    if (!id) {
      throw new Error("O ID do funcionário é obrigatório para atualização");
    }

    const collaboratorExists = await prismaClient.collaborator.findUnique({
      where: { id },
    });

    if (!collaboratorExists) {
      throw new Error("Funcionário não encontrado.");
    }

    // Isso evita o erro de tipagem e impede o Prisma de atualizar campos inalterados
    const updateData: Record<string, any> = {};

    if (name !== undefined) updateData.name = name;
    if (registration !== undefined) updateData.registration = registration;
    if (city !== undefined) updateData.city = city;
    if (status !== undefined) updateData.status = status;

    // Atualiza apenas com os campos modificados
    const updateCollaborator = await prismaClient.collaborator.update({
      where: { id },
      data: updateData,
    });

    return updateCollaborator;
  }
}

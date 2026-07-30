import prismaClient from "../../prisma/index.js";

interface UpdateCollaboratorProps {
  id: string;
  name?: string | undefined;
  registration?: string | undefined;
  city?: string | undefined;
  status?: boolean | undefined;
}

export class UpdateCollaboratorService {
  async execute({ id, name, registration, city, status }: UpdateCollaboratorProps) {
    if (!id) throw new Error("O ID do funcionário é obrigatório.");
    const collaboratorExists = await prismaClient.collaborator.findUnique({
      where: { id },
    });

    if (!collaboratorExists) throw new Error("Funcionário não encontrado.");

    return await prismaClient.collaborator.update({
      where: { id },
      data: {
        //Atualiza somente o que tem valor diferente de vazio
        ...(name !== undefined && { name }),
        ...(registration !== undefined && { registration }),
        ...(city !== undefined && { city }),
        ...(status !== undefined && { status }),
      },
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
  }
}
import prismaClient from "../../prisma/index.js";

interface DeleteCollaboratorProps {
  id: string;
}

export class DeleteCollaboratorService {
  async execute(id: DeleteCollaboratorProps) {
    if (!id) {
      throw new Error("Id do funcionario não encontrado.");
    }

    const findCollaborator = await prismaClient.collaborator.findFirst({
      where: {
        id: id.id,
      },
    });

    if (!findCollaborator) {
      throw new Error("Funcionário não encontrado");
    }

    await prismaClient.collaborator.delete({
      where: {
        id: findCollaborator.id,
      },
    });

    return { message: "Funcionário deletado com sucesso." };
  }
}

import prismaClient from "../../prisma/index.js";

interface DeleteCollaboratorProps {
  id: string;
}

export class DeleteCollaboratorService {
  async execute(id: DeleteCollaboratorProps) {

    // Verifica se passou o id corretamente
    if (!id) {
      throw new Error("Id do funcionario não encontrado.");
    }

    // Faz a busca do colaborador pelo id
    const findCollaborator = await prismaClient.collaborator.findFirst({
      where: {
        id: id.id,
      },
    });

    // Se nao encontrar, de um erro
    if (!findCollaborator) {
      throw new Error("Funcionário não encontrado");
    }

    // Deleta o funcionario
    await prismaClient.collaborator.delete({
      where: {
        id: findCollaborator.id,
      },
    });

    // Retorna a mensagem de sucesso
    return { message: "Funcionário deletado com sucesso." };
  }
}

import prismaClient from "../../prisma/index.js";

interface DeleteOperatorProps {
  id: string;
}

export class DeleteOperatorService {
  async execute(id: DeleteOperatorProps) {

    // Verifica se passou o id corretamente
    if (!id) {
      throw new Error("Id do funcionario não encontrado.");
    }

    // Busca o operador pelo id
    const findOperator = await prismaClient.operator.findFirst({
      where: {
        id: id.id,
      },
    });

    // Se nao encontrar, avise
    if (!findOperator) {
      throw new Error("Funcionário não encontrado");
    }

    // Deleta o operador
    await prismaClient.operator.delete({
      where: {
        id: findOperator.id,
      },
    });

    // Retorna a mensagem de sucesso
    return { message: "Funcionário deletado com sucesso." };
  }
}

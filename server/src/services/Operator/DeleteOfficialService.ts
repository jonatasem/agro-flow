import prismaClient from "../../prisma/index.js";

interface DeleteOperatorProps {
  id: string;
}

export class DeleteOperatorService {
  async execute(id: DeleteOperatorProps) {
    if (!id) {
      throw new Error("Id do funcionario não encontrado.");
    }

    const findOperator = await prismaClient.operator.findFirst({
      where: {
        id: id.id,
      },
    });

    if (!findOperator) {
      throw new Error("Funcionário não encontrado");
    }

    await prismaClient.operator.delete({
      where: {
        id: findOperator.id,
      },
    });

    return { message: "Funcionário deletado com sucesso." };
  }
}

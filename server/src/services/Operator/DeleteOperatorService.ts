import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

interface DeleteOperatorProps {
  id: string;
  userRole: string;
}

export class DeleteOperatorService {
  async execute({ id, userRole }: DeleteOperatorProps) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores.",
      );
    }

    if (!id) {
      throw new Error("Id do funcionario não encontrado.");
    }

    const findOperator = await prismaClient.operator.findFirst({
      where: { id },
    });

    if (!findOperator) {
      throw new Error("Funcionário não encontrado");
    }

    await prismaClient.operator.delete({
      where: { id },
    });

    return { message: "Funcionário deletado com sucesso." };
  }
}

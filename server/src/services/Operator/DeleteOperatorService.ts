// src/services/Operator/DeleteOperatorService.ts
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export class DeleteOperatorService {
  async execute({ id, userRole }: { id: string; userRole: string }) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para excluir operadores.",
      );
    }

    const existing = await prismaClient.operator.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Operador não encontrado.");
    }

    await prismaClient.operator.delete({ where: { id } });

    return { message: "Operador excluído com sucesso." };
  }
}
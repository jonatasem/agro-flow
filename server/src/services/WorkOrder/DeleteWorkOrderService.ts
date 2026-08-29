import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

interface DeleteWorkOrderProps {
  id: string;
  userRole: string;
}
export class DeleteWorkOrderService {
  async execute({ id, userRole }: DeleteWorkOrderProps) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores.",
      );
    }

    if (!id) throw new Error("O ID da ordem de serviço é obrigatório.");
    const workOrderExists = await prismaClient.workOrder.findUnique({
      where: { id },
    });
    if (!workOrderExists) {
      throw new Error("A ordem de serviço não foi encontrada.");
    }
    return await prismaClient.workOrder.delete({
      where: { id },
    });
  }
}

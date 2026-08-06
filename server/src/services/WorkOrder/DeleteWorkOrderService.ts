import prismaClient from "../../prisma/index.js";

interface DeleteWorkOrderProps {
  id: string;
}
export class DeleteWorkOrderService {
  async execute({ id }: DeleteWorkOrderProps) {
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

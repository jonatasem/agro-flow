import prismaClient from "../../prisma/index.js";

interface DeleteSectorProps {
  id: string;
}
export class DeleteSectorService {
  async execute({ id }: DeleteSectorProps) {
    if (!id) throw new Error("O ID da ordem de serviço é obrigatório.");
    const sectorExists = await prismaClient.workOrder.findUnique({
      where: { id },
    });
    if (!sectorExists) {
      throw new Error("A ordem de serviço não foi encontrada.");
    }
    return await prismaClient.workOrder.delete({
      where: { id },
    });
  }
}

import prismaClient from "../../prisma/index.js";

interface UpdateOperatorProps {
  id: string;
  name?: string;
  registration?: string;
  city?: string;
  status?: boolean;
}

export class UpdateOperatorService {
  async execute({ id, name, registration, city, status }: UpdateOperatorProps) {
    if (!id) {
      throw new Error("O ID do funcionário é obrigatório para atualização");
    }

    const operatorExists = await prismaClient.operator.findUnique({
      where: { id },
    });

    if (!operatorExists) {
      throw new Error("Funcionário não encontrado.");
    }

    // Isso evita o erro de tipagem e impede o Prisma de atualizar campos inalterados
    const updateData: Record<string, any> = {};

    if (name !== undefined) updateData.name = name;
    if (registration !== undefined) updateData.registration = registration;
    if (city !== undefined) updateData.city = city;
    if (status !== undefined) updateData.status = status;

    // Atualiza apenas com os campos modificados
    const updateOperator = await prismaClient.operator.update({
      where: { id },
      data: updateData,
    });

    return updateOperator;
  }
}

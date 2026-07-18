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

    // Verifica se o id foi passado corretamente
    if (!id) {
      throw new Error("O ID do funcionário é obrigatório para atualização");
    }

    // Busca o operador pelo id
    const operatorExists = await prismaClient.operator.findUnique({
      where: { id },
    });

    // Se não existir, avise
    if (!operatorExists) {
      throw new Error("Funcionário não encontrado.");
    }

    // Isso evita o erro de tipagem e impede o Prisma de atualizar campos inalterados
    const updateData: Record<string, any> = {};

    // Atualiza apenas com os campos modificados
    if (name !== undefined) updateData.name = name;
    if (registration !== undefined) updateData.registration = registration;
    if (city !== undefined) updateData.city = city;
    if (status !== undefined) updateData.status = status;


    // Atualiza no banco de dados
    const updateOperator = await prismaClient.operator.update({
      where: { id },
      data: updateData,
    });

    // Retorna os dados atualizados
    return updateOperator;
  }
}

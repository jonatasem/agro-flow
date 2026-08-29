import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

interface UpdateOperatorProps {
  id: string;
  name?: string | undefined;
  registration?: string | undefined;
  city?: string | undefined;
  status?: boolean | undefined;
  userRole: string;
}

export class UpdateOperatorService {
  async execute({ id, name, registration, city, status, userRole }: UpdateOperatorProps) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores.",
      );
    }

    const operatorExists = await prismaClient.operator.findUnique({
      where: { id },
    });

    if (!operatorExists) {
      throw new Error("Funcionário não encontrado.");
    }
      
    if (registration && registration !== operatorExists.registration ) {
      const registrationInUse = await prismaClient.operator.findUnique({
        where: { registration },
      });

      if(registrationInUse){
        throw new Error("Esta matricula já está em uso por outro funcionário.")
      }
    }

    // Filtra os dados diferente de undefined
    const updateData = {
      ...(name !== undefined && {name}),
      ...(registration !== undefined && {registration}),
      ...(city !== undefined && {city}),
      ...(status !== undefined && {status})
    }

    const updateOperator = await prismaClient.operator.update({
      where: { id },
      data: updateData,
    });

    return updateOperator;
  }
}

import prismaClient from "../../prisma/index.js";
import { CheckRegistrationService } from "../LoginCollaborator/CheckRegistrationService.js";

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

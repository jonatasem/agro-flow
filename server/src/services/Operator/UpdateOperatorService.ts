import prismaClient from "../../prisma/index.js";

interface UpdateOperatorProps {
  id: string;
  name?: string | undefined;
  registration?: string | undefined;
  city?: string | undefined;
  status?: boolean | undefined;
  userRole: string;
}

export class UpdateOperatorService {
  async execute({ id, name, registration, city, status }: UpdateOperatorProps) {
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

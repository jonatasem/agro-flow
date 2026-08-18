import prismaClient from "../../prisma/index.js";

interface CreateOperatorProps {
  name: string;
  registration: string;
  city: string;
}

export class CreateOperatorService {
  async execute({ name, registration, city }: CreateOperatorProps) {
    if (!name || !registration || !city) {
      throw new Error("Todos os campos são obrigatórios");
    }

    const registrationExists = await prismaClient.operator.findUnique({
      where: { registration },
    });

    if(registrationExists){
      throw new Error("Já existe um funcionário cadastrado com essa matrícula")
    }
  
    const operator = await prismaClient.operator.create({
      data: {
        name,
        registration,
        city
      },
    });

    return operator;
  }
}

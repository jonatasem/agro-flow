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

    const operator = await prismaClient.operator.create({
      data: {
        name,
        registration,
        city,
        status: true,
      },
    });

    return operator;
  }
}

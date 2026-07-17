import prismaClient from "../../prisma/index.js";

interface CreateOperatorProps {
  name: string;
  registration: string;
}

export class CreateOperatorService {
  async execute({ name, registration }: CreateOperatorProps) {
    if (!name || !registration) {
      throw new Error("Todos os campos são obrigatórios");
    }

    const operator = await prismaClient.operator.create({
      data: {
        name,
        registration
      },
    });

    return operator;
  }
}

import prismaClient from "../../prisma/index.js";

interface CreateOperatorProps {
  name: string;
  registration: string;
}

export class CreateOperatorService {
  async execute({ name, registration }: CreateOperatorProps) {
    // Verifica se todos os dados foram enviados
    if (!name || !registration) {
      throw new Error("Todos os campos são obrigatórios");
    }

    // Salva o operador no banco de dados
    const operator = await prismaClient.operator.create({
      data: {
        name,
        registration,
      },
    });

    // Retorna o operador cadastrado
    return operator;
  }
}

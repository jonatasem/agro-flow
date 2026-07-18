import prismaClient from "../../prisma/index.js";

interface CheckProps {
  registration: string;
}

export class CheckRegistrationService {
  async execute({ registration }: CheckProps) {

    // Se a matricula nao for enviada, de erro
    if (!registration) {
      throw new Error("A matrícula é obrigatória");
    }

    // Busca o colaborador pela matricula
    const collaborator = await prismaClient.collaborator.findUnique({
      where: { registration },
      select: {
        name: true,
        status: true,
      },
    });

    // Se nao encontrar a matricula, retorne erro
    if (!collaborator) {
      throw new Error("Matrícula não encontrada");
    }

    // Verifica se o status é ativo
    if (!collaborator.status) {
      throw new Error("Este cadastro está inativo. Contate o administrador.");
    }

    // Retorna apenas o nome para o frontend saudar o usuario
    return {
      name: collaborator.name,
    };
  }
}

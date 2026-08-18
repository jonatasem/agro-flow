import prismaClient from "../../prisma/index.js";

// Interface com os parâmetros necessários para verificar a matrícula
export interface CheckProps {
  registration: string;
}

export class CheckRegistrationService {
  async execute({ registration }: CheckProps) {
    // Valida se a matrícula foi informada
    if (!registration) {
      throw new Error("A matrícula é obrigatória.");
    }

    // Busca o colaborador no banco selecionando apenas o nome e o status
    const collaborator = await prismaClient.collaborator.findUnique({
      where: { registration },
      select: {
        name: true,
        status: true,
      },
    });

    // Se a matrícula não for encontrada
    if (!collaborator) {
      throw new Error("Matrícula não encontrada.");
    }

    // Se o colaborador estiver com o cadastro inativo
    if (!collaborator.status) {
      throw new Error("Este cadastro está inativo. Contate o administrador.");
    }

    // Retorna apenas o nome do colaborador ativo
    return {
      name: collaborator.name,
    };
  }
}
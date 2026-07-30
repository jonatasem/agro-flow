import prismaClient from "../../prisma/index.js";

interface CheckProps {
  registration: string;
}

export class CheckRegistrationService {
  async execute({ registration }: CheckProps) {
    if (!registration) {
      throw new Error("A matrícula é obrigatória");
    }

    const collaborator = await prismaClient.collaborator.findUnique({
      where: { registration },
      select: {
        name: true,
        status: true,
      },
    });

    if (!collaborator) {
      throw new Error("Matrícula não encontrada");
    }

    if (!collaborator.status) {
      throw new Error("Este cadastro está inativo. Contate o administrador.");
    }

    return {
      name: collaborator.name,
    };
  }
}

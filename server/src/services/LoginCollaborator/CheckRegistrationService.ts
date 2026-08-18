import prismaClient from "../../prisma/index.js";

// Interface com os parâmetros necessários para verificar a matrícula
export interface CheckProps {
  registration: string;
}

export class CheckRegistrationService {
  async execute({ registration }: CheckProps) {
    // 1. Valida se a matrícula foi enviada na requisição
    if (!registration) {
      throw new Error("A matrícula é obrigatória.");
    }

    // 2. Busca o colaborador selecionando estritamente os campos necessários
    // Mantemos o payload restrito ao nome e status para prevenir vazamento de dados (Information Disclosure)
    const collaborator = await prismaClient.collaborator.findUnique({
      where: { registration },
      select: {
        name: true,
        status: true,
      },
    });

    // 3. Valida se a matrícula pertence a um registro válido no banco
    if (!collaborator) {
      throw new Error("Matrícula não encontrada.");
    }

    // 4. Impede avanço no fluxo caso o colaborador esteja inativo
    if (!collaborator.status) {
      throw new Error("Este cadastro está inativo. Contate o administrador.");
    }

    // 5. Retorna o nome do colaborador para exibição na 2ª etapa do login (digitação da senha)
    return {
      name: collaborator.name,
    };
  }
}
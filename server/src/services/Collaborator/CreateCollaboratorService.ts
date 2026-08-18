import prismaClient from "../../prisma/index.js";
import { hash } from "bcryptjs";

// Interface para criar um funcionário autorizado no sistema
export interface CreateCollaboratorProps {
  name: string;
  role: string;
  sector: string;
  registration: string;
  password: string;
  city: string;
}

export class CreateCollaboratorService { async execute({ name, role, sector, registration, password, city, }: CreateCollaboratorProps) {
    // Se algum desses campos não forem enviados, de um erro.
    if (!name || !role || !registration || !password || !city) {
      throw new Error("Preencha todos os campos obrigatórios.");
    }

    // Verifica se existe algum funcionario cadastrado com a matrícula informada
    const collaboratorExists = await prismaClient.collaborator.findUnique({
      where: { registration },
    });

    // Se existir, de um erro.
    if (collaboratorExists) {
      throw new Error("Esta matrícula já está cadastrada no sistema.");
    }

    // Criptografa a senha antes de persistir no banco
    const hashedPassword = await hash(password, 8);

    // Cria um novo collaborador com a senha criptografada
    const collaborator = await prismaClient.collaborator.create({
      data: {
        name,
        role,
        sector,
        registration,
        password: hashedPassword,
        city,
        status: true,
      },
    });

    // Remove a hash do objeto retornado
    const { password: _, ...collaboratorWithoutPassword } = collaborator;

    // Retorna todos os campos menos a senha.
    return collaboratorWithoutPassword;
  }
}
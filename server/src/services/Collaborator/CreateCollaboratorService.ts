import prismaClient from "../../prisma/index.js";
import { hash } from "bcryptjs";
import { isManagement } from "../../config/roles.js";

export interface CreateCollaboratorProps {
  name: string;
  role: string;
  sector: string;
  registration: string;
  password: string;
  city: string;
  userRole: string;
}

export class CreateCollaboratorService {
  async execute({
    name,
    role,
    sector,
    registration,
    password,
    city,
    userRole,
  }: CreateCollaboratorProps) {
    // 1. Validação do RBAC
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores.",
      );
    }

    // 2. Validação dos campos do novo colaborador
    if (!name || !role || !sector || !registration || !password || !city) {
      throw new Error("Preencha todos os campos obrigatórios.");
    }

    const collaboratorExists = await prismaClient.collaborator.findUnique({
      where: { registration },
    });

    if (collaboratorExists) {
      throw new Error("Esta matrícula já está cadastrada no sistema.");
    }

    const hashedPassword = await hash(password, 8);

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

    const { password: _, ...collaboratorWithoutPassword } = collaborator;

    return collaboratorWithoutPassword;
  }
}
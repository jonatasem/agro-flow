// src/services/Collaborator/CreateCollaboratorService.ts
import { hash } from "bcryptjs";
import prismaClient from "../../prisma/index.js";
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
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar colaboradores.",
      );
    }

    const exists = await prismaClient.collaborator.findUnique({
      where: { registration },
    });

    if (exists) {
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
      select: {
        id: true,
        name: true,
        role: true,
        sector: true,
        registration: true,
        city: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return collaborator;
  }
}
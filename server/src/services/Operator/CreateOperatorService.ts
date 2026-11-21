// src/services/Operator/CreateOperatorService.ts
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export interface CreateOperatorProps {
  name: string;
  registration: string;
  city: string;
  userRole: string;
}

export class CreateOperatorService {
  async execute({ name, registration, city, userRole }: CreateOperatorProps) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar operadores.",
      );
    }

    const exists = await prismaClient.operator.findUnique({
      where: { registration },
    });

    if (exists) {
      throw new Error("Já existe um operador cadastrado com essa matrícula.");
    }

    return prismaClient.operator.create({
      data: { name, registration, city },
    });
  }
}
// src/services/Operator/UpdateOperatorService.ts
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export interface UpdateOperatorProps {
  id: string;
  name?: string | undefined;
  registration?: string | undefined;
  city?: string | undefined;
  status?: boolean | undefined;
  userRole: string;
}

export class UpdateOperatorService {
  async execute({
    id,
    name,
    registration,
    city,
    status,
    userRole,
  }: UpdateOperatorProps) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para atualizar operadores.",
      );
    }

    const existing = await prismaClient.operator.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Operador não encontrado.");
    }

    if (registration && registration !== existing.registration) {
      const inUse = await prismaClient.operator.findUnique({
        where: { registration },
      });
      if (inUse) {
        throw new Error("Esta matrícula já está em uso por outro operador.");
      }
    }

    const updateData = {
      ...(name !== undefined && { name }),
      ...(registration !== undefined && { registration }),
      ...(city !== undefined && { city }),
      ...(status !== undefined && { status }),
    };

    return prismaClient.operator.update({
      where: { id },
      data: updateData,
    });
  }
}
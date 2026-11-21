// src/services/SectorService/UpdateSectorService.ts
import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export interface UpdateSectorProps {
  id: string;
  setor?: string | undefined;
  qruDescricao?: string | undefined;
  qth?: string | undefined;
  city?: string | undefined;
  solucaoTecnico?: string | undefined;
  tipoCausa?: string | undefined;
  status?: string | undefined;
  tecnicoResponsavelId?: string | undefined;
  operatorId?: string | undefined;
}

export class UpdateSectorService {
  async execute(data: UpdateSectorProps, userRole: string) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para atualizar setores.",
      );
    }

    const existing = await prismaClient.sectorService.findUnique({
      where: { id: data.id },
    });

    if (!existing) {
      throw new Error("Setor da ordem de serviço não encontrado.");
    }

    if (data.operatorId) {
      const operatorExists = await prismaClient.operator.findUnique({
        where: { id: data.operatorId },
      });
      if (!operatorExists) {
        throw new Error("Operador não encontrado com este ID.");
      }
    }

    const updateData = {
      ...(data.setor !== undefined && { setor: data.setor }),
      ...(data.qruDescricao !== undefined && { qruDescricao: data.qruDescricao }),
      ...(data.qth !== undefined && { qth: data.qth }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.solucaoTecnico !== undefined && {
        solucaoTecnico: data.solucaoTecnico,
      }),
      ...(data.tipoCausa !== undefined && { tipoCausa: data.tipoCausa }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.tecnicoResponsavelId !== undefined && {
        tecnicoResponsavelId: data.tecnicoResponsavelId,
      }),
      ...(data.operatorId !== undefined && { operatorId: data.operatorId }),
    };

    return prismaClient.sectorService.update({
      where: { id: data.id },
      data: updateData,
      include: {
        operator: true,
        criador: { select: { id: true, name: true, role: true } },
        tecnicoResponsavel: { select: { id: true, name: true, role: true } },
      },
    });
  }
}
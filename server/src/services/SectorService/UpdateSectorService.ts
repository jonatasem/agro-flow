import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

interface UpdateSectorProps {
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
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para atualizar ordens de serviço.",
      );
    }

    const {
      id,
      setor,
      qruDescricao,
      qth,
      city,
      solucaoTecnico,
      tipoCausa,
      status,
      tecnicoResponsavelId,
      operatorId,
    } = data;

    const orderSectorExists = await prismaClient.sectorService.findUnique({
      where: { id },
    });

    if (!orderSectorExists) {
      throw new Error("Setor da ordem de serviço não encontrado.");
    }

    if (operatorId) {
      const operatorExists = await prismaClient.operator.findUnique({
        where: { id: operatorId },
      });

      if (!operatorExists) {
        throw new Error("Operador não encontrado com este ID.");
      }
    }

    const updateData = {
      ...(setor !== undefined && { setor }),
      ...(qruDescricao !== undefined && { qruDescricao }),
      ...(qth !== undefined && { qth }),
      ...(city !== undefined && { city }),
      ...(solucaoTecnico !== undefined && { solucaoTecnico }),
      ...(tipoCausa !== undefined && { tipoCausa }),
      ...(status !== undefined && { status }),
      ...(tecnicoResponsavelId !== undefined && { tecnicoResponsavelId }),
      ...(operatorId !== undefined && { operatorId }),
    };

    const updatedSector = await prismaClient.sectorService.update({
      where: { id },
      data: updateData,
      include: {
        operator: true,
        criador: { select: { id: true, name: true, role: true } },
        tecnicoResponsavel: { select: { id: true, name: true, role: true } },
      },
    });

    return updatedSector;
  }
}

import prismaClient from "../../prisma/index.js";

interface UpdateWorkOrderProps {
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

export class UpdateWorkOrderService {
  async execute(data: UpdateWorkOrderProps) {
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

    if (!id) {
      throw new Error("O ID do setor da ordem de serviço é obrigatório.");
    }

    const orderSectorExists = await prismaClient.sectorService.findUnique({
      where: { id },
    });

    if (!orderSectorExists) {
      throw new Error("Setor da ordem de serviço não encontrado.");
    }

    let resolvedOperatorId: string | undefined;

    if (operatorId) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(operatorId);
      const operatorExists = await prismaClient.operator.findFirst({
        where: isObjectId ? { id: operatorId } : { registration: operatorId },
      });

      if (!operatorExists) {
        throw new Error("Operador não encontrado com esta matrícula/ID.");
      }

      resolvedOperatorId = operatorExists.id;
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
      ...(resolvedOperatorId !== undefined && { operatorId: resolvedOperatorId }),
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
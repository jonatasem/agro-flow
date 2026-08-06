import prismaclient from "../../prisma/index.js";

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
}

export class UpdateWorkOrderService {
  async execute(data: UpdateWorkOrderProps) {
    const { id, setor, qruDescricao, qth, city, solucaoTecnico, tipoCausa, status } = data;

    if (!id) {
      throw new Error("O ID da ordem de serviço é obrigatório.");
    }

    const OrderSectorExists = await prismaclient.sectorService.findUnique({
      where: { id },
    });

    if (!OrderSectorExists) {
      throw new Error("ID da ordem de serviço não encontrado.");
    }

    // Filtra apenas as propriedades passadas
    const updateData = {
      ...(setor !== undefined && { setor }),
      ...(qruDescricao !== undefined && { qruDescricao }),
      ...(qth !== undefined && { qth }),
      ...(city !== undefined && { city }),
      ...(solucaoTecnico !== undefined && { solucaoTecnico }),
      ...(tipoCausa !== undefined && { tipoCausa }),
      ...(status !== undefined && { status }),
    };

    const updatedSector = await prismaclient.sectorService.update({
      where: { id },
      data: updateData,
    });

    return updatedSector;
  }
}
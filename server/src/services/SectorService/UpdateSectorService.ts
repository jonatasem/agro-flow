import prismaclient from "../../prisma/index.js";

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
}

export class UpdateSectorService {
  async execute(data: UpdateSectorProps) {
    const { id, setor, qruDescricao, qth, city, solucaoTecnico, tipoCausa, status } = data;

    if (!id) {
      throw new Error("O ID do registro de setor é obrigatório.");
    }

    const sectorExists = await prismaclient.sectorService.findUnique({
      where: { id },
    });

    if (!sectorExists) {
      throw new Error("Registro de serviço do setor não encontrado.");
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
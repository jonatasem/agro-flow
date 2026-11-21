// src/services/SectorService/StartSectorServiceService.ts
import prismaClient from "../../prisma/index.js";

export class StartSectorServiceService {
  async execute({
    sectorServiceId,
    tecnicoId,
  }: {
    sectorServiceId: string;
    tecnicoId: string;
  }) {
    const sectorService = await prismaClient.sectorService.findUnique({
      where: { id: sectorServiceId },
    });

    if (!sectorService) {
      throw new Error("Serviço não encontrado.");
    }

    if (sectorService.status !== "AGUARDANDO_MANUTENCAO") {
      throw new Error(
        `Este serviço não pode ser iniciado pois seu status atual é: ${sectorService.status}`,
      );
    }

    return prismaClient.sectorService.update({
      where: { id: sectorServiceId },
      data: {
        status: "EM_MANUTENCAO",
        tecnicoResponsavelId: tecnicoId,
        dataInicioManutencao: new Date(),
      },
      include: {
        workOrder: true,
        operator: true,
        criador: { select: { id: true, name: true, role: true } },
        tecnicoResponsavel: { select: { id: true, name: true, role: true } },
      },
    });
  }
}
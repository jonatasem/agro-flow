// src/services/SectorService/ResumeSectorService.ts
import prismaClient from "../../prisma/index.js";

export class ResumeSectorService {
  async execute({ sectorServiceId }: { sectorServiceId: string }) {
    const sectorService = await prismaClient.sectorService.findUnique({
      where: { id: sectorServiceId },
    });

    if (!sectorService) {
      throw new Error("Serviço não encontrado.");
    }

    if (sectorService.status !== "PAUSADO") {
      throw new Error(
        `Este serviço não está pausado. Status atual: ${sectorService.status}`,
      );
    }

    const lastPause = await prismaClient.servicePause.findFirst({
      where: { sectorServiceId },
      orderBy: { pausedAt: "desc" },
    });

    if (lastPause && !lastPause.resumedAt) {
      await prismaClient.servicePause.update({
        where: { id: lastPause.id },
        data: { resumedAt: new Date() },
      });
    }

    return prismaClient.sectorService.update({
      where: { id: sectorServiceId },
      data: { status: "EM_MANUTENCAO" },
      include: {
        operator: true,
        criador: { select: { id: true, name: true, role: true } },
        tecnicoResponsavel: { select: { id: true, name: true, role: true } },
        pauses: true,
      },
    });
  }
}
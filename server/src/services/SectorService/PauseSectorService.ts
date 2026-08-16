import prismaClient from "../../prisma/index.js";

interface PauseSectorProps {
  sectorServiceId: string;
  pauseReason: "FALTA_DE_PECA" | "AGUARDANDO_OUTRO_SETOR" | "OUTRO_MOTIVO";
  observation: string;
}

export class PauseSectorService {
  async execute({ sectorServiceId, pauseReason, observation }: PauseSectorProps) {
    if (!sectorServiceId || !pauseReason) {
      throw new Error("ID do serviço e motivo da pausa são obrigatórios.");
    }

    const sectorService = await prismaClient.sectorService.findUnique({
      where: { id: sectorServiceId },
    });

    if (!sectorService) {
      throw new Error("Atendimento do setor não encontrado.");
    }

    if (sectorService.status !== "EM_ANDAMENTO") {
      throw new Error("Apenas atendimentos em andamento podem ser pausados.");
    }

    const [updatedService] = await prismaClient.$transaction([
      prismaClient.sectorService.update({
        where: { id: sectorServiceId },
        data: { status: "PAUSADO" },
      }),
    
      prismaClient.servicePause.create({
        data: {
          sectorServiceId,
          reason: pauseReason,
          description: observation,
          pausedAt: new Date(),
        },
      }),
    ]);


    return updatedService;
  }
}
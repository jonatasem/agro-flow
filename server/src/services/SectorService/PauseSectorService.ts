import prismaClient from "../../prisma/index.js";

interface PauseSectorProps {
  sectorServiceId: string;
  pauseReason: "FALTA_DE_PECA" | "AGUARDANDO_OUTRO_SETOR" | "OUTRO_MOTIVO";
  observation: string;
  tecnicoId: string;
}

export class PauseSectorService {
  async execute({
    sectorServiceId,
    pauseReason,
    observation,
    tecnicoId,
  }: PauseSectorProps) {
    const sectorService = await prismaClient.sectorService.findUnique({
      where: { id: sectorServiceId },
    });

    if (!sectorService) {
      throw new Error("Atendimento do setor não encontrado.");
    }

    if (sectorService.tecnicoResponsavelId !== tecnicoId) {
      throw new Error(
        "Apenas o técnico que iniciou a manutenção pode pausa-la.",
      );
    }

    if (sectorService.status !== "EM_MANUTENCAO") {
      throw new Error("Apenas atendimentos em manutenção podem ser pausados.");
    }

    const [updatedService] = await prismaClient.$transaction([
      prismaClient.sectorService.update({
        where: { id: sectorServiceId },
        data: {
          status: "PAUSADO",
          motivoPausa: observation,
        },
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

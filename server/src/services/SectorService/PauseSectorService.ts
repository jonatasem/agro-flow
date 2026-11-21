// src/services/SectorService/PauseSectorService.ts
import prismaClient from "../../prisma/index.js";

export type PauseReason =
  | "FALTA_DE_PECA"
  | "AGUARDANDO_OUTRO_SETOR"
  | "OUTRO_MOTIVO";

export class PauseSectorService {
  async execute({
    sectorServiceId,
    pauseReason,
    observation,
    tecnicoId,
  }: {
    sectorServiceId: string;
    pauseReason: PauseReason;
    observation: string;
    tecnicoId: string;
  }) {
    const sectorService = await prismaClient.sectorService.findUnique({
      where: { id: sectorServiceId },
    });

    if (!sectorService) {
      throw new Error("Atendimento do setor não encontrado.");
    }

    if (sectorService.tecnicoResponsavelId !== tecnicoId) {
      throw new Error(
        "Apenas o técnico que iniciou a manutenção pode pausá-la.",
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
        include: {
          operator: true,
          criador: { select: { id: true, name: true, role: true } },
          tecnicoResponsavel: { select: { id: true, name: true, role: true } },
          pauses: true,
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
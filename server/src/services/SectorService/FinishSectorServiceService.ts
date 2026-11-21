// src/services/SectorService/FinishSectorServiceService.ts
import prismaClient from "../../prisma/index.js";

export class FinishSectorServiceService {
  async execute({
    sectorServiceId,
    solucaoTecnico,
    tipoCausa,
    tecnicoId,
  }: {
    sectorServiceId: string;
    solucaoTecnico: string;
    tipoCausa?: string | undefined;
    tecnicoId: string;
  }) {
    const sectorService = await prismaClient.sectorService.findUnique({
      where: { id: sectorServiceId },
      include: { pauses: true },
    });

    if (!sectorService) {
      throw new Error("Serviço não encontrado.");
    }

    if (sectorService.status !== "EM_MANUTENCAO") {
      throw new Error("Este serviço não está em manutenção.");
    }

    if (sectorService.tecnicoResponsavelId !== tecnicoId) {
      throw new Error(
        "Apenas o técnico que iniciou a manutenção pode finalizá-la.",
      );
    }

    const dataInicio = sectorService.dataInicioManutencao;
    if (!dataInicio) {
      throw new Error("Dados do início da manutenção ausentes.");
    }

    const dataFim = new Date();
    let totalPauseMs = 0;

    for (const pause of sectorService.pauses ?? []) {
      const start = new Date(pause.pausedAt).getTime();
      const end = pause.resumedAt
        ? new Date(pause.resumedAt).getTime()
        : dataFim.getTime();
      totalPauseMs += Math.max(0, end - start);
    }

    const diffMs = dataFim.getTime() - dataInicio.getTime() - totalPauseMs;
    const tempoManutencaoEmMinutos = Math.max(1, Math.round(diffMs / 60000));

    const updatedService = await prismaClient.sectorService.update({
      where: { id: sectorServiceId },
      data: {
        status: "FINALIZADO",
        solucaoTecnico,
        ...(tipoCausa !== undefined && { tipoCausa }),
        dataFimManutencao: dataFim,
        tempoManutencao: tempoManutencaoEmMinutos,
      },
      include: {
        operator: true,
        criador: { select: { id: true, name: true, role: true } },
        tecnicoResponsavel: { select: { id: true, name: true, role: true } },
        pauses: true,
      },
    });

    const totalSectors = await prismaClient.sectorService.count({
      where: { workOrderId: sectorService.workOrderId },
    });

    const finishedSectors = await prismaClient.sectorService.count({
      where: {
        workOrderId: sectorService.workOrderId,
        status: "FINALIZADO",
      },
    });

    if (totalSectors > 0 && totalSectors === finishedSectors) {
      await prismaClient.workOrder.update({
        where: { id: sectorService.workOrderId },
        data: { status: "FINALIZADA" },
      });
    }

    return updatedService;
  }
}
import prismaClient from "../../prisma/index.js";

interface ResumeSectorProps {
  sectorServiceId: string;
}

export class ResumeSectorService {
  async execute({ sectorServiceId }: ResumeSectorProps) {
    if (!sectorServiceId) {
      throw new Error("O ID do serviço é obrigatório.");
    }

    const sectorService = await prismaClient.sectorService.findUnique({
      where: { id: sectorServiceId },
    });

    if (!sectorService) {
      throw new Error("Serviço não encontrado.");
    }

    if (sectorService.status !== "PAUSADO") {
      throw new Error(`Este serviço não está pausado. Status atual: ${sectorService.status}`);
    }

    // 1. Busca a última pausa registrada para este serviço
    const lastPause = await prismaClient.servicePause.findFirst({
      where: { sectorServiceId },
      orderBy: { pausedAt: "desc" },
    });

    // 2. Se a pausa existir e ainda não tiver horário de retorno, atualiza o resumedAt
    if (lastPause && !lastPause.resumedAt) {
      await prismaClient.servicePause.update({
        where: { id: lastPause.id },
        data: { resumedAt: new Date() },
      });
    }

    // 3. Atualiza o status do serviço de volta para EM_MANUTENCAO
    const updatedService = await prismaClient.sectorService.update({
      where: { id: sectorServiceId },
      data: {
        status: "EM_MANUTENCAO",
      },
    });

    return updatedService;
  }
}
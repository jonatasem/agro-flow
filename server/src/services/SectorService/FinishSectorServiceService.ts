import prismaClient from "../../prisma/index.js";

interface FinishSectorServiceProps {
  sectorServiceId: string;
  solucaoTecnico: string;
  tipoCausa: string;
  tecnicoId: string;
}

export class FinishSectorServiceService {
  async execute({
    sectorServiceId,
    solucaoTecnico,
    tipoCausa,
    tecnicoId,
  }: FinishSectorServiceProps) {
    // Busca o serviço e as pausas registradas
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
      throw new Error("Dados do início da manutenção ausente.");
    }

    const dataFim = new Date();

    // Cálculo de tempo de pausas (em milissegundos)
    let totalPauseMs = 0;
    if (sectorService.pauses && sectorService.pauses.length > 0) {
      for (const pause of sectorService.pauses) {
        const start = new Date(pause.pausedAt).getTime();
        const end = pause.resumedAt
          ? new Date(pause.resumedAt).getTime()
          : dataFim.getTime();
        totalPauseMs += end - start;
      }
    }

    // Tempo líquido descontando as pausas
    const diferencaEmMilissegundos =
      dataFim.getTime() - dataInicio.getTime() - totalPauseMs;
    const tempoManutencaoEmMinutos = Math.max(
      1,
      Math.round(diferencaEmMilissegundos / 60000),
    );

    //  Atualizar o serviço do setor
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
        pauses: true,
      },
    });

    // Verificar se todos os setores da O.S. foram finalizados
    const totalServicosDaOrdem = await prismaClient.sectorService.count({
      where: { workOrderId: sectorService.workOrderId },
    });

    const servicosFinalizadosDaOrdem = await prismaClient.sectorService.count({
      where: {
        workOrderId: sectorService.workOrderId,
        status: "FINALIZADO",
      },
    });

    // Finaliza a os global
    if (totalServicosDaOrdem === servicosFinalizadosDaOrdem) {
      await prismaClient.workOrder.update({
        where: { id: sectorService.workOrderId },
        data: {
          status: "FINALIZADA",
        },
      });
    }

    return updatedService;
  }
}

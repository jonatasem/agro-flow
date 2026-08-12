import prismaClient from "../../prisma/index.js";

interface UsedPartInput {
    partId: string;
    quantity: number;
}

interface FinishSectorServiceProps {
    sectorServiceId: string;
    solucaoTecnico: string;
    tipoCausa?: string | undefined;
    tecnicoId: string;
    usedPartIds?: UsedPartInput[];
    usedToolIds?: string[];
}

export class FinishSectorServiceService {
    async execute({
        sectorServiceId,
        solucaoTecnico,
        tipoCausa,
        tecnicoId,
        usedPartIds = [],
        usedToolIds = []
    }: FinishSectorServiceProps) {
        if (!sectorServiceId) {
            throw new Error("O ID do serviço é obrigatório.");
        }

        if (!solucaoTecnico) {
            throw new Error("A solução técnica é necessária para finalizar a os.");
        }

        // Trazemos o serviço e suas pausas registradas
        const sectorService = await prismaClient.sectorService.findUnique({
            where: { id: sectorServiceId },
            include: { pauses: true }
        });

        if (!sectorService) {
            throw new Error("Serviço não encontrado.");
        }

        if (sectorService.status !== "EM_MANUTENCAO") {
            throw new Error("Este serviço não está em manutenção.");
        }

        if (sectorService.tecnicoResponsavelId !== tecnicoId) {
            throw new Error("Apenas o técnico que iniciou a manutenção pode finalizá-la.");
        }

        const dataInicio = sectorService.dataInicioManutencao;

        if (!dataInicio) {
            throw new Error("Dados do início da manutenção ausente.");
        }

        const dataFim = new Date();

        // 1. Cálculo de tempo de pausas (em milissegundos)
        let totalPauseMs = 0;
        if (sectorService.pauses && sectorService.pauses.length > 0) {
            for (const pause of sectorService.pauses) {
                const start = new Date(pause.pausedAt).getTime();
                const end = pause.resumedAt ? new Date(pause.resumedAt).getTime() : dataFim.getTime();
                totalPauseMs += (end - start);
            }
        }

        // 2. Tempo bruto descontando as pausas
        const diferencaEmMilissegundos = (dataFim.getTime() - dataInicio.getTime()) - totalPauseMs;
        const tempoManutencaoEmMinutos = Math.max(
            1,
            Math.round(diferencaEmMilissegundos / 60000)
        );

        // 3. Salvar peças/insumos utilizados (se houver)
        if (usedPartIds.length > 0) {
            await prismaClient.usedPart.createMany({
                data: usedPartIds.map((item) => ({
                    sectorServiceId,
                    partId: item.partId,
                    quantity: item.quantity
                }))
            });
        }

        // 4. Salvar ferramentas utilizadas (se houver)
        if (usedToolIds.length > 0) {
            await prismaClient.usedTool.createMany({
                data: usedToolIds.map((toolId) => ({
                    sectorServiceId,
                    toolId
                }))
            });
        }

        // 5. Atualizar o serviço do setor
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
                usedParts: { include: { part: true } },
                usedTools: { include: { tool: true } },
                pauses: true
            }
        });

        // 6. Verificar se todos os setores da O.S. foram finalizados
        const totalServicosDaOrdem = await prismaClient.sectorService.count({
            where: { workOrderId: sectorService.workOrderId },
        });

        const servicosFinalizadosDaOrdem = await prismaClient.sectorService.count({
            where: {
                workOrderId: sectorService.workOrderId,
                status: "FINALIZADO",
            },
        });

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
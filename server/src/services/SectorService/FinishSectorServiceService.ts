import prismaClient from "../../prisma/index.js";

interface FinishSectorServiceProps {
    sectorServiceId: string;
    solucaoTecnico: string;
    tipoCausa?: string | undefined;
    tecnicoId: string;
}

export class FinishSectorServiceService {
    async execute({ sectorServiceId, solucaoTecnico, tipoCausa, tecnicoId }: FinishSectorServiceProps){
        if(!sectorServiceId){
            throw new Error("O ID do serviço é obrigatório.");
        }

        if(!solucaoTecnico){
            throw new Error("A solução técnica é necessária para finalizar a os.");
        }

        const sectorService = await prismaClient.sectorService.findUnique({
            where: {id: sectorServiceId}
        });

        if(!sectorService){
            throw new Error("Serviço não encontrado.");
        }

        if(sectorService.status !== "EM_MANUTENCAO") {
            throw new Error("Este serviço não está em manutencão.");
        }

        if(sectorService.tecnicoResponsavelId !== tecnicoId) {
            throw new Error("Apenas o técnico que iniciou a manutenção pode finaliza-lá.");
        }

        const dataInicio = sectorService.dataInicioManutencao;
        
        if(!dataInicio){
            throw new Error("Dados do inicio da manutenção ausente.");
        }

        const dataFim = new Date();
        const diferencaEmMilissegundos = dataFim.getTime() - dataInicio.getTime();
        const tempoManutencaoEmMinutos = Math.max(
            1,
            Math.round(diferencaEmMilissegundos / 60000)
        );
    
        const updatedService = await prismaClient.sectorService.update({
            where: { id: sectorServiceId },
                data: {
                    status: "FINALIZADO",
                    solucaoTecnico,
                    ...(tipoCausa !== undefined && { tipoCausa }),
                    dataFimManutencao: dataFim,
                    tempoManutencao: tempoManutencaoEmMinutos,
                },
        });
    
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

import prismaClient from "../../prisma/index.js";

interface FinishSectorServiceProps {
    sectorServiceId: string;
    solucaoTecnico: string;
    tipoCausa?: string;
    tecnicoId: string;
}

export class FinishSectorServiceService {
    async execute({ sectorServiceId, solucaoTecnico, tipoCausa, tecnicoId }: FinishSectorServiceProps){

        // Verifica se o id esta vindo corretamente
        if(!sectorServiceId){
            throw new Error("O ID é obrigatório");
        }

        // Verifica se o usuario enviou a solucao do problema
        if(!solucaoTecnico){
            throw new Error("A solução técnica é necessária para finalizar a os");
        }

        // Busca a os pelo id
        const sectorService = await prismaClient.sectorService.findUnique({
            where: {id: sectorServiceId}
        });

        // Se não encontrar, retorna um erro
        if(!sectorService){
            throw new Error("Serviço não encontrado");
        }

        // Se a os nao tiver em manutencao, retorne um erro
        if(sectorService.status !== "EM_MANUTENCAO") {
            throw new Error("Este serviço não está em manutencão");
        }

        // Apenas o tecnico que iniciou o servico pode finaliza-lo
        if(sectorService.tecnicoResponsavelId !== tecnicoId) {
            throw new Error("Apenas o técnico que iniciou a manutenção pode finaliza-lá");
        }

        // Busca a data de inicio da manutencao
        const dataInicio = sectorService.dataInicioManutencao;
        
        // Se nao existir uma data de inicio, retorne um erro
        if(!dataInicio){
            throw new Error("Dados do inicio da manutenção ausente");
        }

        // Salva o horario que esta finalizando a os
        const dataFim = new Date();

        // Calcula o tempo da manutencao
        const diferencaEmMilissegundos = dataFim.getTime() - dataInicio.getTime();

        // Converte milissegundo em minutos
        // Garante que seja no minimo 1 minuto
        const tempoManutencaoEmMinutos = Math.max(1, Math.round(diferencaEmMilissegundos / 60000));

        // Atualiza no banco de dados
        const updateService = await prismaClient.sectorService.update({
            where: {id: sectorServiceId},
            data: {
                status: "FINALIZADO",
                solucaoTecnico,
                dataFimManutencao: dataFim,
                tempoManutencao: tempoManutencaoEmMinutos,
            },
        });

        // Verifica quantos servicos existem em aberto
        const totalServicosDaOrdem = await prismaClient.sectorService.count({
            where: { workOrderId: sectorService.workOrderId },
        });

        // Busca quantos servicos estao finalizados
        const servicosFinalizadosDaOrdem = await prismaClient.sectorService.count({
            where: {
                workOrderId: sectorService.workOrderId,
                status: "FINALIZADO",
            },
        });

        // Se a quantidade de finalizados for igual ao total de serviços, fecha a O.S. principal
        if (totalServicosDaOrdem === servicosFinalizadosDaOrdem) {
            await prismaClient.workOrder.update({
                where: { id: sectorService.workOrderId },
                data: {
                status: "FINALIZADA",
                },
            });
            
        }

        return updateService;

    }
}

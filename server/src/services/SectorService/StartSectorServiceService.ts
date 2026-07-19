import prismaClient from "../../prisma/index.js";

interface StartSectorServiceProps {
    sectorServiceId: string;
    tecnicoId: string;
}

export class StartSectorServiceService {
    async execute({ sectorServiceId, tecnicoId }: StartSectorServiceProps ){
        
        // Verifica se o id foi enviado corretamente
        if(!sectorServiceId){
            throw new Error("O ID é obrigatório");
        }

        // Busca o service pelo id do setor
        const sectorService = await prismaClient.sectorService.findUnique({
            where: {id: sectorServiceId}
        });

        // Se não encontrar, retorne erro
        if(!sectorService){
            throw new Error("Serviço não encontrado");
        }

        // Verificar se o setorService já não foi iniciado
        if(sectorService.status === "EM_MANUTENCAO") {
            throw new Error("Este serviço já esta em andamento");
        }

        // Tenta atualizar os dados no banco de dados
        const updatedService = await prismaClient.sectorService.update({
            where: {id: sectorServiceId},
            data : {
                status: "EM_MANUTENCAO",
                tecnicoResponsavelId: tecnicoId,
                dataInicioManutencao: new Date(),
            },
            include: {
                workOrder: true,
                tecnicoResponsavel: {
                    select: {
                        name: true,
                        role: true,
                    }
                }
            }
        });

        // Retorna a os atualizada
        return updatedService;
    }
}
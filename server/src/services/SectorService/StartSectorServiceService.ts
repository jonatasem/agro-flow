import prismaClient from "../../prisma/index.js";

interface StartSectorServiceProps {
    sectorServiceId: string;
    tecnicoId: string;
}

export class StartSectorServiceService {
    async execute({ sectorServiceId, tecnicoId }: StartSectorServiceProps ){
        if(!sectorServiceId){
            throw new Error("O ID do serviço é obrigatório");
        }

        if(!tecnicoId){
            throw new Error("O ID do tecnico é obrigatório");
        }

        const sectorService = await prismaClient.sectorService.findUnique({
            where: {id: sectorServiceId}
        });

        if(!sectorService){
            throw new Error("Serviço não encontrado");
        }

        if(sectorService.status !== "AGUARDANDO_MANUTENCAO") {
            throw new Error(
                `Este serviço não pode ser iniciado pois seu status atual é: ${sectorService.status}`
            );
        }

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

        return updatedService;
    }
}
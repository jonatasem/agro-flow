import prismaClient from "../../prisma/index.js";

interface PauseSectorProps {
    sectorServiceId: string;
    reason: "PAUSADO_PECA" | "PAUSADO_OUTRO_SETOR";
    description?: string;
}

export class PauseSectorService {
    async execute({ sectorServiceId, reason, description }: PauseSectorProps) {
        if (!sectorServiceId) {
            throw new Error("O ID do serviço é obrigatório");
        }

        if (!reason || (reason !== "PAUSADO_PECA" && reason !== "PAUSADO_OUTRO_SETOR")) {
            throw new Error("Informe um motivo válido para a pausa (PAUSADO_PECA ou PAUSADO_OUTRO_SETOR)");
        }

        const sectorService = await prismaClient.sectorService.findUnique({
            where: { id: sectorServiceId }
        });

        if (!sectorService) {
            throw new Error("Serviço não encontrado");
        }

        if (sectorService.status !== "EM_MANUTENCAO") {
            throw new Error("Apenas serviços em manutenção podem ser pausados");
        }

        // Registrar o histórico da pausa
        await prismaClient.servicePause.create({
            data: {
                sectorServiceId,
                reason,
                description: description || "",
                pausedAt: new Date()
            }
        });

        // Atualizar o status do serviço
        const updatedService = await prismaClient.sectorService.update({
            where: { id: sectorServiceId },
            data: {
                status: reason
            }
        });

        return updatedService;
    }
}
